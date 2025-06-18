
import type { FC } from 'react';
import type { Palette } from '@/lib/colors';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RotateCcw, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HistoryPanelProps {
  history: Palette[];
  onRevert: (palette: Palette) => void;
  onClearHistory: () => void;
  onClosePanel: () => void;
  onDeleteItem: (index: number) => void;
  maxHistory: number;
}

export const HistoryPanel: FC<HistoryPanelProps> = ({ history, onRevert, onClearHistory, onClosePanel, onDeleteItem, maxHistory }) => {
  if (history.length === 0) {
    return (
      <Card className="w-full md:w-72 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-headline">History</CardTitle>
          <div className="flex items-center">
             <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onClearHistory} aria-label="Clear all history" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear all history</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="ghost" size="icon" onClick={onClosePanel} aria-label="Close history panel" className="h-8 w-8 ml-1 text-muted-foreground hover:text-foreground">
              <X size={18} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Generate some palettes to see them here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full md:w-72 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-headline">History ({history.length}/{maxHistory})</CardTitle>
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onClearHistory} aria-label="Clear all history" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <Trash2 size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear all history</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="ghost" size="icon" onClick={onClosePanel} aria-label="Close history panel" className="h-8 w-8 ml-1 text-muted-foreground hover:text-foreground">
            <X size={18} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3 pr-3">
            <TooltipProvider>
              {history.map((palette, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-md border border-border group"
                >
                  <div
                    className="flex space-x-1 cursor-pointer flex-grow"
                    onClick={() => onRevert(palette)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onRevert(palette); }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Revert to palette ${index + 1}`}
                  >
                    {palette.map((color) => (
                      <div
                        key={color.id}
                        className="h-6 w-6 rounded-sm border border-border"
                        style={{ backgroundColor: color.hex }}
                        title={color.hex}
                      />
                    ))}
                  </div>
                  <div className="flex items-center pl-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 opacity-50 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                          onClick={() => onRevert(palette)}
                          aria-label="Revert to this palette"
                        >
                          <RotateCcw size={14} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Revert to this palette</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 opacity-50 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={() => onDeleteItem(index)}
                          aria-label="Delete this palette from history"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </TooltipTrigger>
                       <TooltipContent side="top">
                        <p>Delete from history</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </TooltipProvider>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
