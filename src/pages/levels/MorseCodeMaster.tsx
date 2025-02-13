
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const morseCode: { [key: string]: string } = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', ' ': ' '
};

export default function MorseCodeMaster() {
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0);
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

  const convertToMorse = (text: string) => {
    return text.toUpperCase().split('').map(char => morseCode[char] || char).join(' ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = "HOW ARE YOU";
    const correctMorse = convertToMorse(message);
    
    if (input.trim() === correctMorse.trim()) {
      const score = Math.max(10 - attempts, 1);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("user_progress")
        .upsert({
          user_id: session.user.id,
          level_id: 4,
          score,
          attempts,
          completed: true,
        });

      if (error) {
        console.error("Error updating progress:", error);
        return;
      }

      setCompleted(true);
      toast({
        title: "Success!",
        description: `You completed the level with ${score} points!`,
      });
    } else {
      setAttempts(prev => prev + 1);
      toast({
        title: "Incorrect",
        description: "Try again! Remember to use dots and dashes.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Level 4: Morse Code Master</CardTitle>
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
                  <p>Convert the message "HOW ARE YOU" to Morse code:</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Morse Code Reference:</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(morseCode).map(([char, code]) => 
                        char !== ' ' && (
                          <div key={char} className="flex gap-2">
                            <span className="font-mono">{char}:</span>
                            <span className="font-mono">{code}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter Morse code (use dots and dashes)"
                    className="font-mono"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Submit
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
