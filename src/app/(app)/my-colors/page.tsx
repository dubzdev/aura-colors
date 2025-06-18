
'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Loader2, Droplets, PlusCircle, Trash2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserSavedColors, deleteUserSavedColor, type UserSavedColor } from '@/services/color-service';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { copyToClipboard } from '@/lib/colors';

function MyColorsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [userColors, setUserColors] = useState<UserSavedColor[]>([]);
  const [isLoadingColors, setIsLoadingColors] = useState(true);
  const [colorToDelete, setColorToDelete] = useState<UserSavedColor | null>(null);

  const fetchColors = useCallback(async () => {
    if (user) {
      setIsLoadingColors(true);
      const colors = await getUserSavedColors(user.uid);
      setUserColors(colors);
      setIsLoadingColors(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/signin?redirect=/my-colors');
    } else if (user) {
      fetchColors();
    }
  }, [user, authLoading, router, fetchColors]);

  const handleDeleteConfirm = async () => {
    if (user && colorToDelete) {
      const result = await deleteUserSavedColor(user.uid, colorToDelete.id);
      if (result.success) {
        toast({ title: "Color Deleted", description: result.message });
        setUserColors(prev => prev.filter(c => c.id !== colorToDelete.id));
      } else {
        toast({ variant: "destructive", title: "Deletion Failed", description: result.message });
      }
      setColorToDelete(null); 
    }
  };

  const handleCopyHex = async (hex: string) => {
    if (await copyToClipboard(hex)) {
      toast({ title: "Copied!", description: `${hex.toUpperCase()} copied to clipboard.` });
    } else {
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy to clipboard." });
    }
  };

  if (authLoading || (!user && !authLoading) || isLoadingColors) {
    return (
      <div className="container mx-auto flex flex-1 flex-col items-center justify-center p-4 py-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          {authLoading ? "Authenticating..." : (isLoadingColors ? "Loading your colors..." : "Redirecting...")}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex-1 p-4 py-8">
      <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">My Saved Colors</h1>
        <Button asChild size="lg">
          <Link href="/">
            <PlusCircle className="mr-2 h-5 w-5" /> Discover New Colors
          </Link>
        </Button>
      </div>

      {userColors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center shadow-sm">
          <Droplets className="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-semibold text-foreground">No Colors Saved Yet!</h2>
          <p className="mt-2 mb-6 max-w-md text-muted-foreground">
            Looks like you haven't saved any individual colors. Start exploring, save your favorites, and they'll appear here.
          </p>
          <Button asChild size="lg">
            <Link href="/">Go to Generator</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8">
          {userColors.map(color => (
            <div key={color.id} className="group relative rounded-lg border bg-card p-3 shadow aspect-square flex flex-col items-center justify-center transition-shadow hover:shadow-lg">
              <div 
                style={{ backgroundColor: color.hex }} 
                className="h-20 w-20 rounded-full border mb-3 shadow-inner cursor-pointer"
                onClick={() => handleCopyHex(color.hex)}
                title={`Click to copy ${color.hex}`}
              />
              <p 
                className="font-mono text-sm text-foreground cursor-pointer"
                onClick={() => handleCopyHex(color.hex)}
                title={`Click to copy ${color.hex}`}
              >
                {color.hex.toUpperCase()} <Copy className="inline h-3 w-3 ml-1 text-muted-foreground group-hover:text-primary transition-colors" />
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                 {color.createdAt ? new Date(color.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-1 right-1 h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setColorToDelete(color)}
                    title="Delete color"
                    >
                    <Trash2 size={14} />
                  </Button>
                </AlertDialogTrigger>
                {colorToDelete && colorToDelete.id === color.id && (
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the color {colorToDelete.hex}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setColorToDelete(null)}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                )}
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyColorsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto flex flex-1 flex-col items-center justify-center p-4 py-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <MyColorsPageContent />
    </Suspense>
  );
}
