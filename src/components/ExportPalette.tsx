import type { FC } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download, ClipboardList, Palette as PaletteIcon } from 'lucide-react'; // Renamed Palette to PaletteIcon to avoid conflict
import type { Palette } from '@/lib/colors';
import { copyToClipboard } from '@/lib/colors';
import { useToast } from "@/hooks/use-toast";

interface ExportPaletteProps {
  palette: Palette;
}

export const ExportPalette: FC<ExportPaletteProps> = ({ palette }) => {
  const { toast } = useToast();

  const handleExport = async (format: 'hex' | 'rgb' | 'css') => {
    let output = '';
    switch (format) {
      case 'hex':
        output = palette.map(c => c.hex.toUpperCase()).join('\n');
        break;
      case 'rgb':
        output = palette.map(c => {
          const r = parseInt(c.hex.slice(1, 3), 16);
          const g = parseInt(c.hex.slice(3, 5), 16);
          const b = parseInt(c.hex.slice(5, 7), 16);
          return `rgb(${r}, ${g}, ${b})`;
        }).join('\n');
        break;
      case 'css':
        output = palette.map((c, i) => `--color-aura-${i + 1}: ${c.hex.toUpperCase()};`).join('\n');
        break;
    }
    
    if (await copyToClipboard(output)) {
      toast({ title: "Copied to Clipboard!", description: `${format.toUpperCase()} values copied.` });
    } else {
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy to clipboard." });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="shadow-sm">
          <Download className="mr-2 h-4 w-4" /> Export Palette
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-headline">Copy as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('hex')}>
          <ClipboardList className="mr-2 h-4 w-4" />
          <span>HEX List</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('rgb')}>
          <PaletteIcon className="mr-2 h-4 w-4" />
          <span>RGB List</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('css')}>
          <ClipboardList className="mr-2 h-4 w-4" />
          <span>CSS Variables</span>
        </DropdownMenuItem>
        {/* <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <Image className="mr-2 h-4 w-4" />
          <span>PNG Image (Soon)</span>
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
