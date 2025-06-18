
'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { Lock, Unlock, Copy, Edit3, Bookmark, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Color } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { saveUserColor, type SaveColorData } from '@/services/color-service';


interface ColorSwatchProps {
  colorItem: Color;
  onLockToggle: () => void;
  onAdjustClick: () => void;
  onCopyHex: (hex: string) => void;
  isAdjusterOpenForThis: boolean;
}

export const ColorSwatch: FC<ColorSwatchProps> = ({ colorItem, onLockToggle, onAdjustClick, onCopyHex, isAdjusterOpenForThis }) => {
  const { hex, locked } = colorItem;
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSavingColor, setIsSavingColor] = useState(false);

  const handleAdjustClick = () => {
    if (!locked) {
      onAdjustClick();
    }
  };

  const handleSaveColor = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: "Sign In Required", description: "Please sign in to save colors." });
      return;
    }
    setIsSavingColor(true);
    const colorData: SaveColorData = { hex };
    const result = await saveUserColor(user.uid, colorData);

    if (result.success) {
      toast({ title: "Color Saved!", description: result.message });
    } else {
      toast({ variant: "destructive", title: "Save Failed", description: result.message });
    }
    setIsSavingColor(false);
  };
  
  return (
    <TooltipProvider delayDuration={200}>
      <div 
        className={cn(
          "relative h-full flex flex-col items-center justify-end p-4 transition-all duration-300 ease-in-out shadow-md group", 
          isAdjusterOpenForThis && "ring-4 ring-primary ring-offset-2 ring-offset-background"
        )}
        style={{ backgroundColor: hex }}
        role="button"
        tabIndex={locked ? -1 : 0}
        onClick={handleAdjustClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAdjustClick();}}
        aria-label={`Color ${hex}. ${locked ? 'Locked.' : 'Click to adjust.'}`}
      >
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLockToggle}
                className="h-8 w-8 text-white hover:bg-white/20 focus:bg-white/30"
                aria-label={locked ? 'Unlock color' : 'Lock color'}
              >
                {locked ? <Lock size={18} /> : <Unlock size={18} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{locked ? 'Unlock' : 'Lock'} color (L)</p>
            </TooltipContent>
          </Tooltip>
          {!locked && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onAdjustClick}
                  className="h-8 w-8 text-white hover:bg-white/20 focus:bg-white/30"
                  aria-label="Adjust color"
                >
                  <Edit3 size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Adjust color</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSaveColor}
                disabled={isSavingColor}
                className="h-8 w-8 text-white hover:bg-white/20 focus:bg-white/30"
                aria-label="Save color"
              >
                {isSavingColor ? <Loader2 size={18} className="animate-spin" /> : <Bookmark size={18} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{user ? (isSavingColor ? 'Saving...' : 'Save color') : 'Sign in to save'}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div 
          className="text-center cursor-pointer transition-transform duration-200 hover:scale-105"
          onClick={(e) => {
            e.stopPropagation();
            onCopyHex(hex);
          }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onCopyHex(hex); }}}
          tabIndex={0}
          role="button"
          aria-label={`Copy color code ${hex}`}
        >
          <span 
            className="font-medium text-lg px-3 py-1 rounded bg-black/30 text-white shadow-lg"
          >
            {hex.toUpperCase()}
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
};
