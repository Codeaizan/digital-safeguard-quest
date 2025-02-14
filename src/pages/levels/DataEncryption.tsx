
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Key } from "lucide-react";
import { Input } from "@/components/ui/input";

const messages = [
  {
    plain: "Transfer $500 to Account 12345",
    key: 3,
  },
  {
    plain: "Meeting at 3 PM tomorrow",
    key: 5,
  },
  {
    plain: "Password is SecurePass123",
    key: 2,
  }
];

const caesarCipher = (text: string, shift: number, decrypt = false) => {
  const actualShift = decrypt ? (26 - shift) : shift;
  return text.split('').map(char => {
    if (char.match(/[a-zA-Z]/)) {
      const code = char.charCodeAt(0);
      const isUpperCase = code >= 65 && code <= 90;
      const base = isUpperCase ? 65 : 97;
      return String.fromCharCode(
        ((code - base + actualShift) % 26) + base
      );
    }
    return char;
  }).join('');
};

export default function DataEncryption() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [encrypted, setEncrypted] = useState("");
  const [decrypted, setDecrypted] = useState("");
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);
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

  const handleEncrypt = () => {
    const message = messages[currentIndex];
    const encryptedText = caesarCipher(message.plain, message.key, false);
    setEncrypted(encryptedText);
  };

  const handleDecrypt = async () => {
    const message = messages[currentIndex];
    const correctDecryption = message.plain;
    
    if (decrypted.trim() === correctDecryption) {
      if (currentIndex === messages.length - 1) {
        const finalScore = Math.max(0, 10 - (attempts * 2));
        setScore(finalScore);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { error } = await supabase
          .from("user_progress")
          .upsert({
            user_id: session.user.id,
            level_id: 7,
            score: finalScore,
            completed: true,
          }, {
            onConflict: 'user_id,level_id'
          });

        if (error) {
          console.error("Error updating progress:", error);
          return;
        }

        setCompleted(true);
        toast({
          title: "Level Complete!",
          description: `You scored ${finalScore} points!`,
        });
      } else {
        setCurrentIndex(prev => prev + 1);
        setEncrypted("");
        setDecrypted("");
        toast({
          title: "Correct!",
          description: "Moving to next message.",
        });
      }
    } else {
      setAttempts(prev => prev + 1);
      toast({
        title: "Incorrect",
        description: "Try again! Each incorrect attempt costs 2 points.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-800 border-matrix/20">
          <CardHeader>
            <CardTitle className="text-matrix flex items-center gap-2">
              <Lock className="h-6 w-6" />
              Level 7: Data Encryption Challenge
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completed ? (
              <div className="text-center space-y-4 text-white">
                <h2 className="text-xl font-bold">Level Complete!</h2>
                <p>You scored {score} out of 10 points!</p>
                <Button onClick={() => navigate("/dashboard")} className="bg-matrix/20 hover:bg-matrix/40 text-matrix">
                  Return to Dashboard
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-lg font-semibold mb-2 text-gray-300">
                    Message {currentIndex + 1} of {messages.length}
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Original Message
                    </label>
                    <Card className="bg-gray-700/50">
                      <CardContent className="p-4">
                        <p className="text-white">{messages[currentIndex].plain}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Button
                    onClick={handleEncrypt}
                    className="w-full bg-matrix/20 hover:bg-matrix/40 text-matrix"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Encrypt Message
                  </Button>

                  {encrypted && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Encrypted Message
                      </label>
                      <Card className="bg-gray-700/50">
                        <CardContent className="p-4">
                          <p className="text-matrix font-mono">{encrypted}</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Decrypt the Message
                    </label>
                    <Input
                      value={decrypted}
                      onChange={(e) => setDecrypted(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Type the decrypted message here..."
                    />
                  </div>

                  <Button
                    onClick={handleDecrypt}
                    className="w-full bg-matrix/20 hover:bg-matrix/40 text-matrix"
                    disabled={!encrypted || !decrypted}
                  >
                    Submit Decryption
                  </Button>
                </div>

                <p className="text-sm text-gray-400 text-center">
                  Attempts: {attempts} (-{attempts * 2} points)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
