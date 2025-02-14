import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordStrengthBar } from "@/components/PasswordStrengthBar";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function PasswordMaster() {
  const [password, setPassword] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [strength, setStrength] = useState(0);
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const checkPasswordStrength = (pass: string) => {
    const checks = {
      length: pass.length >= 8,
      number: /\d/.test(pass),
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
    };

    const score = Object.values(checks).filter(Boolean).length;
    return score === 5 ? 3 : Math.floor(score / 2);
  };

  const updateProgress = async (score: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("user_progress")
      .upsert({
        user_id: session.user.id,
        level_id: 1,
        score,
        attempts: attempts + 1,
        completed: true,
      });

    if (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to save progress",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setStrength(checkPasswordStrength(newPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (strength < 3) {
      toast({
        title: "Password not strong enough",
        description: "Please ensure your password meets all requirements",
        variant: "destructive",
      });
      setAttempts(prev => prev + 1);
      return;
    }

    const score = Math.max(10 - attempts, 1);
    await updateProgress(score);
    setCompleted(true);
    
    toast({
      title: "Level Complete!",
      description: `You earned ${score} points!`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Level 1: Password Master</CardTitle>
          </CardHeader>
          <CardContent>
            {completed ? (
              <div className="text-center space-y-4">
                <h2 className="text-xl font-bold text-green-600">
                  Congratulations!
                </h2>
                <p>You've completed this level!</p>
                <Button onClick={() => navigate("/dashboard")}>
                  Return to Dashboard
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                  <PasswordStrengthBar strength={strength} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Password must contain:</p>
                  <ul className="text-sm text-gray-600 list-disc pl-5">
                    <li>At least 8 characters</li>
                    <li>Numbers</li>
                    <li>Uppercase letters</li>
                    <li>Lowercase letters</li>
                    <li>Special characters</li>
                  </ul>
                </div>
                <Button type="submit" className="w-full">
                  Submit Password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
