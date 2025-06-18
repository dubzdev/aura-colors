
'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Palette as PaletteType, Color as ColorType, generateNewPalette, copyToClipboard } from '@/lib/colors';
import { ColorSwatch } from '@/components/ColorSwatch';
import { ColorAdjuster } from '@/components/ColorAdjuster';
import { HistoryPanel } from '@/components/HistoryPanel';
import { ExportPalette } from '@/components/ExportPalette';
import { Button } from '@/components/ui/button';
import { useKeyRelease } from '@/hooks/useKeyPress';
import { Lightbulb, Info, Sparkles, Palette as PaletteIconLucide, History as HistoryIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { mockPredefinedPalettes, type PredefinedPalette } from '@/lib/mock-palettes';
import { PredefinedPaletteDisplay } from '@/components/PredefinedPaletteDisplay';
import { AiPaletteGenerator } from '@/components/AiPaletteGenerator';

const MAX_HISTORY_LENGTH = 10;
const NUM_FEATURED_PALETTES = 4;
const NUM_RANDOM_PALETTES = 8;

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [palette, setPalette] = useState<PaletteType>([]);
  const [history, setHistory] = useState<PaletteType[]>([]);
  const [activeAdjusterIndex, setActiveAdjusterIndex] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  const [featuredPalettes, setFeaturedPalettes] = useState<PredefinedPalette[]>([]);
  const [randomlySelectedPalettes, setRandomlySelectedPalettes] = useState<PredefinedPalette[]>([]);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(true);

  const colorSwatchRefs = useRef<(HTMLDivElement | null)[]>([]);

  const newId = useCallback(() => Math.random().toString(36).substring(2, 9), []);

  const updatePaletteAndHistory = useCallback((newPaletteSource: PaletteType, sourceMessage: string, addToHistory: boolean = true) => {
    setPalette(newPaletteSource);
    setActiveAdjusterIndex(null); // Close adjuster when palette changes
    toast({ title: "Palette Loaded", description: sourceMessage });

    if (addToHistory && newPaletteSource.length > 0) {
      setHistory(prevHistory => {
        const currentHistory = prevHistory || [];
        const newPaletteString = JSON.stringify(newPaletteSource.map(c => ({hex: c.hex, locked: c.locked})));
        const latestHistoryString = currentHistory.length > 0 ? JSON.stringify(currentHistory[0].map(c => ({hex: c.hex, locked: c.locked}))) : null;

        if (newPaletteString !== latestHistoryString) {
          return [newPaletteSource, ...currentHistory].slice(0, MAX_HISTORY_LENGTH);
        }
        return currentHistory;
      });
    }
  }, [toast, MAX_HISTORY_LENGTH]);
  
  useEffect(() => {
    setIsClient(true);
    const paletteToLoadSlug = searchParams.get('loadPaletteSlug');
    const colorsToLoad = searchParams.get('loadPaletteColors');
    const paletteNameFromQuery = searchParams.get('paletteName');

    if (paletteToLoadSlug) {
      const foundPalette = mockPredefinedPalettes.find(p => p.id === paletteToLoadSlug);
      if (foundPalette) {
        const newPaletteFromQuery: PaletteType = foundPalette.colors.map(hex => ({
          hex,
          locked: false,
          id: newId()
        }));
        updatePaletteAndHistory(newPaletteFromQuery, `Loaded palette: ${foundPalette.name}.`);
      }
       router.replace('/', undefined); // Clear query params
    } else if (colorsToLoad) {
        const hexColors = colorsToLoad.split(',').map(c => `#${c}`);
        if (hexColors.length === 5 && hexColors.every(c => /^#[0-9A-F]{6}$/i.test(c))) {
             const newPaletteFromQuery: PaletteType = hexColors.map(hex => ({
                hex,
                locked: false,
                id: newId()
            }));
            const name = paletteNameFromQuery ? decodeURIComponent(paletteNameFromQuery) : "Custom Palette";
            updatePaletteAndHistory(newPaletteFromQuery, `Loaded custom palette: ${name}.`);
        } else {
            toast({variant: 'destructive', title: 'Load Error', description: 'Invalid custom palette colors in URL.'});
        }
        router.replace('/', undefined); // Clear query params
    } else if (palette.length === 0) { 
      const initialPalette = generateNewPalette();
      // updatePaletteAndHistory(initialPalette, "Initial palette generated.", false); // Don't add to history initially
      setPalette(initialPalette); // Just set, don't add to history or toast for the very first load
    }
  }, [searchParams, updatePaletteAndHistory, newId, router, palette.length, toast]);
  
  useEffect(() => {
    if (isClient && mockPredefinedPalettes.length > 0) {
      const shuffledPalettes = [...mockPredefinedPalettes].sort(() => 0.5 - Math.random());
      
      setFeaturedPalettes(shuffledPalettes.slice(0, NUM_FEATURED_PALETTES));
      
      const remainingPalettes = shuffledPalettes.slice(NUM_FEATURED_PALETTES);
      setRandomlySelectedPalettes(remainingPalettes.slice(0, NUM_RANDOM_PALETTES));
    }
  }, [isClient]);

  const handleGeneratePalette = useCallback(() => {
    if (palette.length > 0) {
        setHistory(prevHistory => {
          const currentHistory = prevHistory || [];
          const currentPaletteString = JSON.stringify(palette.map(c => ({hex: c.hex, locked: c.locked})));
          const latestHistoryString = currentHistory.length > 0 ? JSON.stringify(currentHistory[0].map(c => ({hex: c.hex, locked: c.locked}))) : null;
          if (currentPaletteString !== latestHistoryString) { // Only add if different from the latest
              return [palette, ...currentHistory].slice(0, MAX_HISTORY_LENGTH);
          }
          return currentHistory;
        });
    }
    const newGenPalette = generateNewPalette(palette.filter(c => c.locked));
    setPalette(newGenPalette); 
    setActiveAdjusterIndex(null); 
    // No toast here for generate, it's a primary action
  }, [palette, MAX_HISTORY_LENGTH]);

  useKeyRelease(' ', handleGeneratePalette);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'l' && palette.length > 0) {
         const focusedSwatch = colorSwatchRefs.current.find(ref => ref === document.activeElement || ref?.contains(document.activeElement));
         if (focusedSwatch) {
           const index = parseInt(focusedSwatch.dataset.index || '-1', 10);
           if (index !== -1) {
             toggleLock(index)();
           }
         }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [palette, colorSwatchRefs]);


  const toggleLock = (index: number) => () => {
    setPalette(prevPalette =>
      prevPalette.map((color, i) =>
        i === index ? { ...color, locked: !color.locked } : color
      )
    );
    setActiveAdjusterIndex(null); 
  };

  const handleAdjustClick = (index: number) => {
    if (palette[index].locked) return;
    setActiveAdjusterIndex(index === activeAdjusterIndex ? null : index);
  };

  const updateColorInPalette = (index: number, newHex: string) => {
    setPalette(prevPalette =>
      prevPalette.map((color, i) => (i === index ? { ...color, hex: newHex } : color))
    );
  };

  const handleCopyHex = async (hex: string) => {
    if (await copyToClipboard(hex)) {
      toast({ title: "Copied!", description: `${hex.toUpperCase()} copied to clipboard.` });
    } else {
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy to clipboard." });
    }
  };

  const revertToHistoryPalette = (historyPalette: PaletteType) => {
    updatePaletteAndHistory(historyPalette, "Loaded palette from history.", false); // Don't re-add to history
  };
  
  const clearHistory = () => {
    setHistory([]);
    toast({ title: "History Cleared", description: "All palettes removed from history." });
  };

  const handleDeleteHistoryItem = (indexToDelete: number) => {
    setHistory(prevHistory => prevHistory.filter((_, index) => index !== indexToDelete));
    toast({ title: "History Item Removed", description: "Palette removed from history." });
  };

  const handleAiPaletteGenerated = (colors: string[]) => {
    const newPaletteFromAi: PaletteType = colors.map(hex => ({
      hex,
      locked: false,
      id: newId()
    }));
    updatePaletteAndHistory(newPaletteFromAi, "AI generated a new palette.");
    setIsAiGeneratorOpen(false); 
  };


  if (!isClient) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center h-full text-muted-foreground">
        Loading AuraColors...
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 min-h-[50vh] sm:min-h-[60vh]">
          {palette.map((colorItem, index) => (
            <ColorAdjuster
              key={colorItem.id}
              colorItem={colorItem}
              onColorChange={(newHex) => updateColorInPalette(index, newHex)}
              onClose={() => setActiveAdjusterIndex(null)}
              isOpen={activeAdjusterIndex === index}
              triggerElement={
                <div ref={el => colorSwatchRefs.current[index] = el} data-index={index} className="h-full group">
                  <ColorSwatch
                    colorItem={colorItem}
                    onLockToggle={toggleLock(index)}
                    onAdjustClick={() => handleAdjustClick(index)}
                    onCopyHex={handleCopyHex}
                    isAdjusterOpenForThis={activeAdjusterIndex === index}
                  />
                </div>
              }
            />
          ))}
        </div>
        
        <div className="container mx-auto px-4 py-8">
          {featuredPalettes.length > 0 && (
            <PredefinedPaletteDisplay 
              title="Featured Palettes" 
              palettesToDisplay={featuredPalettes} 
            />
          )}
          {randomlySelectedPalettes.length > 0 && (
             <div className="mt-12">
                <PredefinedPaletteDisplay 
                title="Discover More" 
                palettesToDisplay={randomlySelectedPalettes} 
                />
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md border-t z-10">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <Button onClick={handleGeneratePalette} className="shadow-lg px-4 py-3 sm:px-6 text-base">
              <Lightbulb className="mr-2 h-5 w-5" /> Generate
            </Button>
            <Button onClick={() => setIsAiGeneratorOpen(true)} variant="outline" className="shadow-sm px-4 py-3 sm:px-6 text-base">
                <Sparkles className="mr-2 h-5 w-5 text-primary" /> AI Generate
            </Button>
            <ExportPalette palette={palette} />
             <Alert className="hidden md:flex p-2 max-w-xs items-center border-accent/30 bg-accent/10 text-accent-foreground">
              <Info className="h-5 w-5 mr-2 text-accent" />
              <AlertDescription className="text-xs">
                Press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-accent-foreground bg-accent/20 border border-accent/30 rounded-md">Spacebar</kbd> to generate.
                Click color code to copy.
              </AlertDescription>
            </Alert>
          </div>
          {isHistoryPanelOpen ? (
            <HistoryPanel 
              history={history} 
              onRevert={revertToHistoryPalette} 
              onClearHistory={clearHistory} 
              onClosePanel={() => setIsHistoryPanelOpen(false)}
              onDeleteItem={handleDeleteHistoryItem}
              maxHistory={MAX_HISTORY_LENGTH} 
            />
          ) : (
            <Button 
              onClick={() => setIsHistoryPanelOpen(true)} 
              variant="outline" 
              className="shadow-sm px-4 py-3 text-base md:ml-auto"
              aria-label="Show history panel"
            >
              <HistoryIcon className="mr-2 h-5 w-5" /> Show History
            </Button>
          )}
        </div>
      </div>
      <AiPaletteGenerator 
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        onPaletteGenerated={handleAiPaletteGenerated}
      />
    </div>
  );
}

// Wrap HomePageContent with Suspense because useSearchParams() needs it
export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex flex-col flex-1 items-center justify-center h-full text-muted-foreground">Loading AuraColors...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
