
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const emails = [
  {
    id: 1,
    subject: "Account Security Alert",
    from: "security@bank-secure-alert.com",
    content: "Dear customer, your account has been locked. Click here to verify your identity.",
    isPhishing: true,
  },
  {
    id: 2,
    subject: "Your Amazon Order",
    from: "orders@amazon.com",
    content: "Your order #123456 has been shipped. Track your package here.",
    isPhishing: false,
  },
  {
    id: 3,
    subject: "Urgent: Password Reset Required",
    from: "microsoft.support@hotmail.com",
    content: "Your Microsoft account requires immediate attention. Reset your password now.",
    isPhishing: true,
  },
  {
    id: 4,
    subject: "Netflix Subscription Update",
    from: "netflix@emails.com",
    content: "Your payment method has expired. Update your billing information now to continue streaming.",
    isPhishing: true,
  },
  {
    id: 5,
    subject: "Team Meeting Schedule",
    from: "hr@company.com",
    content: "The weekly team meeting has been rescheduled to 3 PM tomorrow.",
    isPhishing: false,
  }
];

export default function PhishingDetective() {
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  const [score, setScore] = useState(0);
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

  const handleAnswer = async (isPhishing: boolean) => {
    const currentEmail = emails[currentEmailIndex];
    const correct = isPhishing === currentEmail.isPhishing;
    
    if (correct) {
      setScore(prevScore => prevScore + 1);
      toast({
        title: "Correct!",
        description: "Good job identifying this email!",
      });
    } else {
      toast({
        title: "Incorrect",
        description: "That wasn't the right answer. Keep practicing!",
        variant: "destructive",
      });
    }

    if (currentEmailIndex === emails.length - 1) {
      const finalScore = correct ? score + 1 : score;
      await updateProgress(finalScore);
      setCompleted(true);
    } else {
      setCurrentEmailIndex(currentEmailIndex + 1);
    }
  };

  const updateProgress = async (finalScore: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("user_progress")
      .upsert({
        user_id: session.user.id,
        level_id: 2,
        score: finalScore,
        completed: true,
      }, {
        onConflict: 'user_id,level_id'
      });

    if (error) {
      console.error("Error updating progress:", error);
    }
  };

  const currentEmail = emails[currentEmailIndex];

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-800 border-matrix/20">
          <CardHeader>
            <CardTitle className="text-matrix">Level 2: Phishing Detective</CardTitle>
          </CardHeader>
          <CardContent>
            {completed ? (
              <div className="text-center space-y-4 text-white">
                <h2 className="text-xl font-bold">Level Complete!</h2>
                <p>You scored {score} out of {emails.length} points!</p>
                <Button onClick={() => navigate("/dashboard")} className="bg-matrix/20 hover:bg-matrix/40 text-matrix">
                  Return to Dashboard
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border rounded-lg p-4 space-y-2 bg-gray-700/50 text-white">
                  <p><strong>From:</strong> {currentEmail.from}</p>
                  <p><strong>Subject:</strong> {currentEmail.subject}</p>
                  <p><strong>Content:</strong></p>
                  <p className="mt-2">{currentEmail.content}</p>
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleAnswer(true)}
                  >
                    Mark as Phishing
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleAnswer(false)}
                  >
                    Mark as Safe
                  </Button>
                </div>
                <p className="text-center text-sm text-gray-400">
                  Email {currentEmailIndex + 1} of {emails.length}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
