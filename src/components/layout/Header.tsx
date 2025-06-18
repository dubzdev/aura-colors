
'use client';

import Link from 'next/link';
import { AuraColorsLogo } from '@/components/AuraColorsLogo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Palette, LogIn, LogOut, User, Loader2, Home, Compass, Droplets } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, loading, signOutUser } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <AuraColorsLogo />
        </Link>
        <nav className="flex items-center space-x-2 sm:space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-foreground">
              <Home className="mr-2 h-4 w-4" /> Generate
            </Link>
          </Button>
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              <Compass className="mr-2 h-4 w-4" /> Explore
            </Link>
          </Button>
          
          {loading ? (
            <Button variant="ghost" size="icon" disabled>
              <Loader2 className="h-5 w-5 animate-spin" />
            </Button>
          ) : user ? (
            <>
              {/* My Palettes button visible on larger screens directly in nav */}
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/my-palettes" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  <Palette className="mr-2 h-4 w-4" /> My Palettes
                </Link>
              </Button>
               {/* My Colors button visible on larger screens directly in nav */}
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/my-colors" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  <Droplets className="mr-2 h-4 w-4" /> My Colors
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                      <AvatarFallback>
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : <User className="h-4 w-4" />)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* My Palettes link for smaller screens or when direct nav buttons are hidden */}
                  <DropdownMenuItem asChild className="sm:hidden">
                     <Link href="/my-palettes">
                        <Palette className="mr-2 h-4 w-4" /> My Palettes
                     </Link>
                  </DropdownMenuItem>
                  {/* My Colors link for smaller screens or when direct nav buttons are hidden */}
                   <DropdownMenuItem asChild className="sm:hidden">
                     <Link href="/my-colors">
                        <Droplets className="mr-2 h-4 w-4" /> My Colors
                     </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOutUser} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="default" size="sm" asChild>
              <Link href="/signin">
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
