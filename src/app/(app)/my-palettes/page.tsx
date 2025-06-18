
'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Loader2, Palette as PaletteIconLucide, PlusCircle, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserSavedPalettes, deleteUserSavedPalette, type UserSavedPalette } from '@/services/palette-service';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { copyToClipboard } from '@/lib/colors';

function MyPalettesPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [userPalettes, setUserPalettes] = useState<UserSavedPalette[]>([]);
  const [isLoadingPalettes, setIsLoadingPalettes] = useState(true);
  const [paletteToDelete, setPaletteToDelete] = useState<UserSavedPalette | null>(null);


  const fetchPalettes = useCallback(async () => {
    if (user) {
      setIsLoadingPalettes(true);
      const palettes = await getUserSavedPalettes(user.uid);
      setUserPalettes(palettes);
      setIsLoadingPalettes(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/signin?redirect=/my-palettes');
    } else if (user) {
      fetchPalettes();
    }
  }, [user, authLoading, router, fetchPalettes]);

  const handleDeleteConfirm = async () => {
    if (user && paletteToDelete) {
      const result = await deleteUserSavedPalette(user.uid, paletteToDelete.id);
      if (result.success) {
        toast({ title: "Palette Deleted", description: result.message });
        setUserPalettes(prev => prev.filter(p => p.id !== paletteToDelete.id));
      } else {
        toast({ variant: "destructive", title: "Deletion Failed", description: result.message });
      }
      setPaletteToDelete(null); // Close dialog
    }
  };

  const handleLoadInGenerator = (palette: UserSavedPalette) => {
    if (palette.originalPaletteId) {
         router.push(`/?loadPaletteSlug=${palette.originalPaletteId}`);
    } else {
      const colorsQueryParam = palette.colors.map(c => c.substring(1)).join(','); // RRGGBB,RRGGBB...
      router.push(`/?loadPaletteColors=${colorsQueryParam}&paletteName=${encodeURIComponent(palette.name)}`);
      // The homepage handles `loadPaletteColors` and `paletteName`
    }
  };


  if (authLoading || (!user && !authLoading) || isLoadingPalettes) {
    return (
      <div className="container mx-auto flex flex-1 flex-col items-center justify-center p-4 py-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          {authLoading ? "Authenticating..." : (isLoadingPalettes ? "Loading your palettes..." : "Redirecting...")}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex-1 p-4 py-8">
      <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">My Palettes</h1>
        <Button asChild size="lg">
          <Link href="/">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Palette
          </Link>
        </Button>
      </div>

      {userPalettes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center shadow-sm">
          <PaletteIconLucide className="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-semibold text-foreground">No Palettes Yet!</h2>
          <p className="mt-2 mb-6 max-w-md text-muted-foreground">
            Looks like you haven't saved any palettes. Start exploring and save your favorites, they'll appear here.
          </p>
          <Button asChild size="lg">
            <Link href="/">Discover Palettes</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {userPalettes.map(palette => (
            <div key={palette.id} className="rounded-lg border bg-card p-4 shadow-lg transition-shadow hover:shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{palette.name}</h3>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setPaletteToDelete(palette)}>
                                <Trash2 size={16} />
                            </Button>
                        </AlertDialogTrigger>
                         {paletteToDelete && paletteToDelete.id === palette.id && (
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the palette "{paletteToDelete.name}".
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setPaletteToDelete(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        )}
                    </AlertDialog>
                </div>
                <div 
                    className="mt-2 flex h-20 w-full rounded-md overflow-hidden cursor-pointer mb-3"
                    onClick={() => handleLoadInGenerator(palette)}
                    title="Load in generator"
                >
                  {palette.colors.map((color, idx) => (
                    <div key={`${palette.id}-${color}-${idx}`} style={{ backgroundColor: color }} className="h-full flex-1" title={color} />
                  ))}
                </div>
                {palette.originalPaletteId && (
                     <Button variant="outline" size="sm" asChild className="mb-1 w-full text-xs">
                        <Link href={`/palette/${palette.originalPaletteId}`}>
                            <ExternalLink className="mr-2 h-3 w-3" /> View Original Details
                        </Link>
                    </Button>
                )}
                 <p className="text-xs text-muted-foreground">
                    Saved: {palette.createdAt ? new Date(palette.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyPalettesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto flex flex-1 flex-col items-center justify-center p-4 py-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <MyPalettesPageContent />
    </Suspense>
  );
}

