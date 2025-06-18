
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { AuraColorsLogo } from '@/components/AuraColorsLogo';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

// Inline SVG for Google icon
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
  </svg>
);

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const { user, loading, signInWithGoogle, signInWithEmailPassword, signUpWithEmailPassword } = useAuth();
  const router = useRouter();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!loading && user) {
      const redirectPath = new URLSearchParams(window.location.search).get('redirect') || '/';
      router.push(redirectPath);
    }
  }, [user, loading, router]);

  const handleEmailSignIn: SubmitHandler<SignInFormValues> = async (data) => {
    await signInWithEmailPassword(data.email, data.password);
  };

  const handleEmailSignUp: SubmitHandler<SignInFormValues> = async (data) => {
    await signUpWithEmailPassword(data.email, data.password);
  };
  
  if (loading && !form.formState.isSubmitting) { // Show main loader if not submitting form
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }
   if (user) { // If user is somehow present but redirect hasn't happened.
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-card p-8 shadow-2xl">
        <div className="flex flex-col items-center">
         <AuraColorsLogo className="h-10 mb-6" />
          <h1 className="text-3xl font-bold tracking-tight text-center text-foreground">Sign In or Create Account</h1>
          <p className="mt-2 text-center text-muted-foreground">
            Access your saved palettes and more.
          </p>
        </div>
        
        <Button 
          onClick={signInWithGoogle} 
          disabled={loading || form.formState.isSubmitting}
          className="w-full text-base py-6 shadow-md hover:shadow-lg transition-shadow"
          variant="outline"
        >
          {loading && !form.formState.isSubmitting ? ( // Show loader only if general loading, not form submitting
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Sign In with Google
        </Button>

        <div className="flex items-center space-x-2 my-6">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>

        <Form {...form}>
          <form className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="you@example.com" 
                      {...field} 
                      disabled={form.formState.isSubmitting}
                      className="text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                      disabled={form.formState.isSubmitting}
                      className="text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                type="button" // Change to button to use specific handler
                onClick={form.handleSubmit(handleEmailSignIn)}
                disabled={form.formState.isSubmitting || loading}
                className="w-full text-base py-3 shadow-sm hover:shadow-md transition-shadow flex-1"
              >
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Sign In with Email
              </Button>
              <Button 
                type="button" // Change to button to use specific handler
                onClick={form.handleSubmit(handleEmailSignUp)}
                disabled={form.formState.isSubmitting || loading}
                variant="secondary"
                className="w-full text-base py-3 shadow-sm hover:shadow-md transition-shadow flex-1"
              >
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Create Account
              </Button>
            </div>
          </form>
        </Form>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          By signing in or creating an account, you agree to our (non-existent) Terms of Service and Privacy Policy.
        </p>
      </div>
       <footer className="mt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} AuraColors. Your creative space for colors.
      </footer>
    </div>
  );
}

