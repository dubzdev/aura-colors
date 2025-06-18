import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { XIcon, CheckIcon } from 'lucide-react';
import { hexToHsb, hsbToHex, Color } from '@/lib/colors';

interface ColorAdjusterProps {
  colorItem: Color;
  onColorChange: (newHex: string) => void;
  onClose: () => void;
  isOpen: boolean;
  triggerElement: React.ReactNode;
}

export const ColorAdjuster: FC<ColorAdjusterProps> = ({ colorItem, onColorChange, onClose, isOpen, triggerElement }) => {
  const [h, setH] = useState(0);
  const [s, setS] = useState(0);
  const [b, setB] = useState(0);
  const [currentHex, setCurrentHex] = useState(colorItem.hex);

  const updateHsbFromHex = useCallback((hexValue: string) => {
    if (/^#[0-9A-F]{6}$/i.test(hexValue)) {
      const { h, s, b } = hexToHsb(hexValue);
      setH(h);
      setS(s);
      setB(b);
    }
  }, []);

  useEffect(() => {
    setCurrentHex(colorItem.hex);
    updateHsbFromHex(colorItem.hex);
  }, [colorItem.hex, updateHsbFromHex, isOpen]);
  
  const handleHsbChange = (newH: number, newS: number, newB: number) => {
    setH(newH);
    setS(newS);
    setB(newB);
    const newHex = hsbToHex({ h: newH, s: newS, b: newB });
    setCurrentHex(newHex);
    onColorChange(newHex);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHexValue = e.target.value;
    setCurrentHex(newHexValue);
    if (/^#[0-9A-F]{6}$/i.test(newHexValue)) {
      updateHsbFromHex(newHexValue);
      onColorChange(newHexValue);
    }
  };
  
  return (
    <Popover open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <PopoverTrigger asChild>{triggerElement}</PopoverTrigger>
      <PopoverContent className="w-80 p-6 shadow-2xl rounded-lg" side="bottom" align="center">
        <div className="grid gap-6">
          <div className="space-y-2">
            <h4 className="font-medium leading-none text-lg font-headline">Adjust Color</h4>
            <p className="text-sm text-muted-foreground">
              Fine-tune Hue, Saturation, and Brightness.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="hex" className="text-sm">HEX</Label>
              <Input
                id="hex"
                value={currentHex.toUpperCase()}
                onChange={handleHexInputChange}
                className="col-span-2 h-10 text-base"
                maxLength={7}
              />
            </div>
             <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: currentHex }} />
              <span className="text-sm font-mono">{currentHex.toUpperCase()}</span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hue" className="text-sm">Hue ({h}°)</Label>
              <Slider
                id="hue"
                min={0}
                max={360}
                step={1}
                value={[h]}
                onValueChange={([val]) => handleHsbChange(val, s, b)}
                className="[&>span:first-child]:h-3 [&>span:first-child>span]:h-3 [&>span:last-child]:h-5 [&>span:last-child]:w-5"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="saturation" className="text-sm">Saturation ({s}%)</Label>
              <Slider
                id="saturation"
                min={0}
                max={100}
                step={1}
                value={[s]}
                onValueChange={([val]) => handleHsbChange(h, val, b)}
                className="[&>span:first-child]:h-3 [&>span:first-child>span]:h-3 [&>span:last-child]:h-5 [&>span:last-child]:w-5"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="brightness" className="text-sm">Brightness ({b}%)</Label>
              <Slider
                id="brightness"
                min={0}
                max={100}
                step={1}
                value={[b]}
                onValueChange={([val]) => handleHsbChange(h, s, val)}
                 className="[&>span:first-child]:h-3 [&>span:first-child>span]:h-3 [&>span:last-child]:h-5 [&>span:last-child]:w-5"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={onClose} variant="outline" size="sm">
              <CheckIcon className="mr-2 h-4 w-4" /> Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
