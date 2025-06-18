
'use client';

import type { FC } from 'react';
import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generatePaletteWithAi, type GeneratePaletteInput } from '@/ai/flows/generate-palette-flow';
import { Loader2, Wand2, Image as ImageIcon, Palette as PaletteIcon, Type } from 'lucide-react'; // Palette aliased to PaletteIcon

interface AiPaletteGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onPaletteGenerated: (colors: string[]) => void;
}

type GenerationMode = 'image' | 'color' | 'keywords';

export const AiPaletteGenerator: FC<AiPaletteGeneratorProps> = ({ isOpen, onClose, onPaletteGenerated }) => {
  const [activeTab, setActiveTab] = useState<GenerationMode>('keywords');
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [baseColorHex, setBaseColorHex] = useState<string>('#560BAD');
  const [keywords, setKeywords] = useState<string>('Cyberpunk cityscape');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit for Gemini Flash
        toast({
          variant: 'destructive',
          title: 'Image Too Large',
          description: 'Please upload an image smaller than 4MB.',
        });
        setImageDataUri(null);
        if (event.target) event.target.value = ''; // Reset file input
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageDataUri(reader.result as string);
      };
      reader.onerror = () => {
        toast({
            variant: 'destructive',
            title: 'Image Read Error',
            description: 'Could not read the image file. Please try another image.',
        });
        setImageDataUri(null);
      };
      reader.readAsDataURL(file);
    } else {
      setImageDataUri(null);
    }
  };

  const validateHexColor = (hex: string) => /^#[0-9A-F]{6}$/i.test(hex);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    let input: GeneratePaletteInput;

    switch (activeTab) {
      case 'image':
        if (!imageDataUri) {
          toast({ variant: 'destructive', title: 'Error', description: 'Please upload an image.' });
          setIsLoading(false);
          return;
        }
        input = { generationMode: 'image', imageDataUri };
        break;
      case 'color':
        if (!validateHexColor(baseColorHex)) {
          toast({ variant: 'destructive', title: 'Invalid HEX Color', description: 'Please enter a valid 6-digit HEX color (e.g., #RRGGBB).' });
          setIsLoading(false);
          return;
        }
        input = { generationMode: 'color', baseColorHex };
        break;
      case 'keywords':
        if (!keywords.trim() || keywords.trim().length < 3) {
          toast({ variant: 'destructive', title: 'Invalid Keywords', description: 'Please enter at least 3 characters for keywords.' });
          setIsLoading(false);
          return;
        }
        input = { generationMode: 'keywords', keywords: keywords.trim() };
        break;
      default:
        toast({ variant: 'destructive', title: 'Error', description: 'Invalid generation mode.' });
        setIsLoading(false);
        return;
    }

    try {
      const result = await generatePaletteWithAi(input);
      if (result.colors && result.colors.length === 5) {
        onPaletteGenerated(result.colors);
        toast({ title: 'Palette Generated!', description: 'AI has created a new palette for you.' });
        onClose(); 
      } else {
        throw new Error('AI did not return the expected 5 colors.');
      }
    } catch (error: any) {
      console.error('AI Palette Generation Error:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error.message || 'Could not generate palette. Please try again or refine your input.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, imageDataUri, baseColorHex, keywords, onPaletteGenerated, onClose, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Wand2 className="mr-2 h-5 w-5 text-primary" />
            Generate Palette with AI
          </DialogTitle>
          <DialogDescription>
            Let AI create stunning color palettes based on your input. Choose a generation method below.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as GenerationMode)} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="keywords"><Type className="mr-1 h-4 w-4 sm:mr-2" />Keywords</TabsTrigger>
            <TabsTrigger value="color"><PaletteIcon className="mr-1 h-4 w-4 sm:mr-2" />Color</TabsTrigger>
            <TabsTrigger value="image"><ImageIcon className="mr-1 h-4 w-4 sm:mr-2" />Image</TabsTrigger>
          </TabsList>
          <TabsContent value="keywords" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="keywords-input">Keywords</Label>
              <Input
                id="keywords-input"
                placeholder="e.g., serene forest, vibrant sunset"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                disabled={isLoading}
              />
               <p className="text-xs text-muted-foreground">Describe the mood, theme, or objects for your palette.</p>
            </div>
          </TabsContent>
          <TabsContent value="color" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="hex-color-input">Seed Color (HEX)</Label>
              <Input
                id="hex-color-input"
                placeholder="#RRGGBB"
                value={baseColorHex}
                onChange={(e) => setBaseColorHex(e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`)}
                maxLength={7}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Enter a HEX code to inspire the palette.</p>
            </div>
             <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded-md border" 
                  style={{ backgroundColor: validateHexColor(baseColorHex) ? baseColorHex : 'transparent' }} 
                />
                <span className="text-sm font-mono">{validateHexColor(baseColorHex) ? baseColorHex.toUpperCase() : 'Invalid HEX'}</span>
            </div>
          </TabsContent>
          <TabsContent value="image" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="image-upload">Upload Image</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleImageUpload}
                disabled={isLoading}
                className="file:mr-2 file:text-primary file:font-semibold file:bg-primary/10 file:rounded-md file:border-none file:px-3 file:py-1.5 hover:file:bg-primary/20"
              />
              <p className="text-xs text-muted-foreground">Max 4MB. PNG, JPG, WEBP, GIF supported.</p>
            </div>
            {imageDataUri && (
              <div className="mt-2">
                <img src={imageDataUri} alt="Preview" className="max-h-32 w-auto rounded-md border" />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || (activeTab === 'image' && !imageDataUri) || (activeTab === 'color' && !validateHexColor(baseColorHex)) || (activeTab === 'keywords' && keywords.trim().length < 3) }>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generate with AI
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
