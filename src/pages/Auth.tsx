
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate("/dashboard");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              username: username || 'Anonymous Player',
            }
          },
        });
        if (error) throw error;
        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="absolute top-4 right-4">
        <Button 
          variant="outline" 
          onClick={() => navigate("/")}
          className="text-white"
        >
          Back to Home
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="backdrop-blur-lg bg-white/10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {isSignUp
                  ? "Sign up to start your cybersecurity journey"
                  : "Login to continue your training"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                {isSignUp && (
                  <>
                    <Input
                      placeholder="Username (consider using a fun alias!)"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-white/20 text-white placeholder:text-gray-400"
                    />
                    <p className="text-sm text-gray-400">
                      For privacy, consider using a creative username instead of your real name
                    </p>
                  </>
                )}
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/20 text-white placeholder:text-gray-400"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/20 text-white placeholder:text-gray-400"
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-white hover:text-gray-300"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp
                    ? "Already have an account? Login"
                    : "Don't have an account? Sign Up"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
