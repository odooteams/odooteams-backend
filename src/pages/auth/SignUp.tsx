import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Lock, User, UserPlus, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { checkPasswordSafety, breachMessage } from '@/lib/security/pwned';
import SEOHead from '@/components/seo/SEOHead';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pwStatus, setPwStatus] = useState<'idle' | 'checking' | 'safe' | 'breached'>('idle');
  const [pwMessage, setPwMessage] = useState('');
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  // Live leaked-password check (debounced, k-anonymity — password never leaves the browser)
  useEffect(() => {
    if (!password) {
      setPwStatus('idle');
      setPwMessage('');
      return;
    }
    setPwStatus('checking');
    const t = setTimeout(async () => {
      const result = await checkPasswordSafety(password, [email, fullName]);
      if (result.breached || result.weakReason) {
        setPwStatus('breached');
        setPwMessage(breachMessage(result));
      } else {
        setPwStatus('safe');
        setPwMessage(result.offline ? 'Strength checks passed (breach database unreachable).' : 'This password was not found in any known breach.');
      }
    }, 500);
    return () => clearTimeout(t);
  }, [password, email, fullName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    const safety = await checkPasswordSafety(password, [email, fullName]);
    if (safety.breached || safety.weakReason) {
      setIsLoading(false);
      setPwStatus('breached');
      setPwMessage(breachMessage(safety));
      toast.error(breachMessage(safety));
      return;
    }

    const { error } = await signUp(email, password, fullName);
    setIsLoading(false);

    if (error) {
      if (error.message?.includes('already registered')) {
        toast.error('This email is already registered. Please sign in instead.');
      } else {
        toast.error(error.message || 'Failed to create account');
      }
    } else {
      toast.success('Account created! Please check your email to verify your account.');
      navigate('/auth/signin');
    }
  };

  return (
    <>
      <SEOHead 
        title="Sign Up"
        description="Create an account to get started"
      />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Enter your details to create your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={8}
                  />
                </div>
                {pwStatus === 'checking' && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Checking against breached password database...
                  </p>
                )}
                {pwStatus === 'breached' && (
                  <p className="text-xs text-destructive flex items-start gap-1">
                    <ShieldAlert className="h-3 w-3 mt-0.5 shrink-0" /> {pwMessage}
                  </p>
                )}
                {pwStatus === 'safe' && (
                  <p className="text-xs text-primary flex items-start gap-1">
                    <ShieldCheck className="h-3 w-3 mt-0.5 shrink-0" /> {pwMessage}
                  </p>
                )}
                {pwStatus === 'idle' && (
                  <p className="text-xs text-muted-foreground">
                    At least 8 characters, with letters and numbers. Breached passwords are blocked.
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading || pwStatus === 'breached' || pwStatus === 'checking'}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </span>
                )}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link to="/auth/signin" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
