
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockPredefinedPalettes, type PredefinedPalette } from '@/lib/mock-palettes';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard, calculatePaletteSimilarity } from '@/lib/colors';
import { ChevronLeft, Copy, Share2, Loader2, Palette as PaletteIcon, Bookmark } from 'lucide-react';
import { PredefinedPaletteDisplay } from '@/components/PredefinedPaletteDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { saveUserPalette, type SavePaletteData } from '@/services/palette-service';

const NUM_SIMILAR_PALETTES = 4;

function PaletteDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [palette, setPalette] = useState<PredefinedPalette | null>(null);
  const [similarPalettes, setSimilarPalettes] = useState<PredefinedPalette[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const slug = typeof params.slug === 'string' ? params.slug : '';

  useEffect(() => {
    setIsClient(true);
    if (slug) {
      const foundPalette = mockPredefinedPalettes.find(p => p.id === slug);
      setPalette(foundPalette || null);

      if (foundPalette) {
        const otherPalettes = mockPredefinedPalettes.filter(p => p.id !== slug);
        
        const palettesWithSimilarity = otherPalettes.map(otherP => ({
          palette: otherP,
          similarity: calculatePaletteSimilarity(foundPalette.colors, otherP.colors)
        }));

        palettesWithSimilarity.sort((a, b) => a.similarity - b.similarity);
        
        setSimilarPalettes(palettesWithSimilarity.slice(0, NUM_SIMILAR_PALETTES).map(item => item.palette));
      }
    }
  }, [slug]);

  const handleCopyHex = async (hex: string) => {
    if (await copyToClipboard(hex)) {
      toast({ title: "Copied!", description: `${hex.toUpperCase()} copied to clipboard.` });
    } else {
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy to clipboard." });
    }
  };

  const handleLoadInGenerator = () => {
    if (palette) {
      router.push(`/?loadPaletteSlug=${palette.id}`);
    }
  };
  
  const handleShare = async () => {
    if (palette && typeof window !== 'undefined') {
      const shareUrl = window.location.href;
      try {
        if (navigator.share) {
          await navigator.share({
            title: `AuraColors Palette: ${palette.name}`,
            text: `Check out this color palette: ${palette.name}`,
            url: shareUrl,
          });
          toast({ title: "Shared!", description: "Palette link shared." });
        } else {
          await copyToClipboard(shareUrl);
          toast({ title: "Link Copied!", description: "Palette URL copied to clipboard." });
        }
      } catch (error) {
        console.error('Error sharing:', error);
        await copyToClipboard(shareUrl);
        toast({ title: "Link Copied!", description: "Could not share, URL copied to clipboard instead." });
      }
    }
  };

  const handleSavePalette = async () => {
    if (!palette) return;

    if (!user) {
      toast({ title: "Sign In Required", description: "Please sign in to save this palette." });
      return;
    }

    setIsSaving(true);
    const paletteData: SavePaletteData = {
        name: palette.name,
        colors: [...palette.colors], 
        originalPaletteId: palette.id,
    };
    const result = await saveUserPalette(user.uid, paletteData);

    if (result.success) {
      toast({ title: "Palette Saved!", description: `"${palette.name}" has been added to My Palettes.` });
    } else {
      toast({ variant: "destructive", title: "Save Failed", description: result.message });
    }
    setIsSaving(false);
  };

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!palette) {
    return (
      <div className="container mx-auto px-4 py-8 text-center flex-1">
        <h1 className="text-3xl font-bold mb-4 text-destructive">Palette Not Found</h1>
        <p className="text-muted-foreground mb-6">The color palette you're looking for doesn't exist or couldn't be loaded.</p>
        <Button asChild variant="outline">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Generator
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex-1">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Generator
        </Link>
      </Button>

      <Card className="mb-12 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-4xl font-bold text-primary tracking-tight">{palette.name}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleLoadInGenerator} size="lg" disabled={isSaving}>
                <PaletteIcon className="mr-2 h-5 w-5" /> Load in Generator
              </Button>
               <Button onClick={handleSavePalette} variant="outline" size="lg" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Bookmark className="mr-2 h-5 w-5" />}
                {isSaving ? "Saving..." : "Save Palette"}
              </Button>
              <Button onClick={handleShare} variant="outline" size="lg" disabled={isSaving}>
                <Share2 className="mr-2 h-5 w-5" /> Share
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 h-[40vh] min-h-[300px] rounded-lg overflow-hidden shadow-inner">
            {palette.colors.map((color, index) => (
              <div
                key={`${palette.id}-${color}-${index}`}
                style={{ backgroundColor: color }}
                className="flex flex-col items-center justify-end p-4 group cursor-pointer"
                onClick={() => handleCopyHex(color)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') handleCopyHex(color)}}
                aria-label={`Copy color ${color}`}
              >
                <div className="bg-black/40 text-white px-3 py-1.5 rounded-md text-lg font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center">
                  {color.toUpperCase()}
                  <Copy size={16} className="ml-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {similarPalettes.length > 0 && (
        <PredefinedPaletteDisplay
          title="Similar Palettes"
          palettesToDisplay={similarPalettes}
        />
      )}
    </div>
  );
}

export default function PaletteDetailPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <PaletteDetailPageContent />
    </Suspense>
  );
}
