
'use client';

import type { FC } from 'react';
import Link from 'next/link';
import type { PredefinedPalette } from '@/lib/mock-palettes';
import { Button } from '@/components/ui/button';
import { Bookmark, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/use-auth';
import { saveUserPalette, type SavePaletteData } from '@/services/palette-service';
import { useState } from 'react';

interface PredefinedPaletteDisplayProps {
  palettesToDisplay: PredefinedPalette[];
  title: string;
}

export const PredefinedPaletteDisplay: FC<PredefinedPaletteDisplayProps> = ({ palettesToDisplay, title }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});


  const handleSavePalette = async (e: React.MouseEvent, palette: PredefinedPalette) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      toast({ title: "Sign In Required", description: "Please sign in to save palettes.", variant: "default" });
      return;
    }
    
    setSavingStates(prev => ({ ...prev, [palette.id]: true }));

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
    setSavingStates(prev => ({ ...prev, [palette.id]: false }));
  };

  if (!palettesToDisplay || palettesToDisplay.length === 0) {
    return null;
  }

  return (
    <div className="my-8">
      <h2 className="text-2xl font-semibold mb-6 text-center text-foreground">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <TooltipProvider delayDuration={100}>
          {palettesToDisplay.map((p) => (
            <div key={p.id} className="relative group">
              <Link
                href={`/palette/${p.id}`}
                className="block border rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label={`View details for palette: ${p.name}`}
              >
                <h3 className="text-lg font-medium mb-3 text-card-foreground truncate group-hover:text-primary transition-colors">{p.name}</h3>
                <div className="flex space-x-1 h-16 rounded-md overflow-hidden">
                  {p.colors.map((color, colorIdx) => (
                    <div
                      key={`${p.id}-${color}-${colorIdx}`}
                      className="flex-1 transition-transform duration-150 ease-in-out group-hover:scale-y-105"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </Link>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 z-10 h-9 w-9 text-muted-foreground hover:text-primary bg-card/50 backdrop-blur-sm hover:bg-card/80 rounded-full shadow-md opacity-70 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleSavePalette(e, p)}
                    aria-label={`Save palette ${p.name}`}
                    disabled={savingStates[p.id]}
                  >
                    {savingStates[p.id] ? <Loader2 className="h-5 w-5 animate-spin" /> : <Bookmark size={20} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{user ? (savingStates[p.id] ? 'Saving...' : 'Save palette') : 'Sign in to save'}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
};
