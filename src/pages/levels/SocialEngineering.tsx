
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const scenarios = [
  {
    id: 1,
    question: "A caller claims to be from IT support and needs your login credentials to fix a system issue. Should you share this information?",
    correctAnswer: false,
    explanation: "Never share login credentials, even with IT support. They should have their own admin access if needed."
  },
  {
    id: 2,
    question: "Someone from HR sends an email asking for your employee ID to process a bonus. The email is from your company domain. Should you provide it?",
    correctAnswer: true,
    explanation: "Employee ID is generally safe to share with verified internal HR staff using official channels."
  },
  {
    id: 3,
    question: "A social media quiz asks for your mother's maiden name to generate your 'fantasy name'. Should you participate?",
    correctAnswer: false,
    explanation: "Mother's maiden name is commonly used as a security question. Avoid sharing such information."
  },
  {
    id: 4,
    question: "A colleague asks for your current project's name and general timeline. Should you share this information?",
    correctAnswer: true,
    explanation: "General project information is usually safe to share with colleagues unless explicitly classified."
  },
  {
    id: 5,
    question: "A phone caller offers to help you claim a prize but needs your bank account details. Should you provide them?",
    correctAnswer: false,
    explanation: "Never share banking information with unsolicited callers, regardless of the offer."
  }
];

export default function SocialEngineering() {
  const [currentScenario, setCurrentScenario] = useState(0);
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

  const handleAnswer = async (answer: boolean) => {
    const current = scenarios[currentScenario];
    const isCorrect = answer === current.correctAnswer;
    
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
      toast({
        title: "Correct!",
        description: current.explanation,
      });
    } else {
      toast({
        title: "Incorrect",
        description: current.explanation,
        variant: "destructive",
      });
    }

    const isLastScenario = currentScenario === scenarios.length - 1;
    if (isLastScenario) {
      const finalScore = score + (isCorrect ? 1 : 0);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("user_progress")
        .upsert({
          user_id: session.user.id,
          level_id: 5,
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
    } else {
      setCurrentScenario(currentScenario + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-800 border-matrix/20">
          <CardHeader>
            <CardTitle className="text-matrix">Level 5: Social Engineering Defense</CardTitle>
          </CardHeader>
          <CardContent>
            {completed ? (
              <div className="text-center space-y-4 text-white">
                <h2 className="text-xl font-bold">Level Complete!</h2>
                <p>You scored {score} out of {scenarios.length} points!</p>
                <Button onClick={() => navigate("/dashboard")} className="bg-matrix/20 hover:bg-matrix/40 text-matrix">
                  Return to Dashboard
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-lg font-semibold mb-2 text-gray-300">
                    Scenario {currentScenario + 1} of {scenarios.length}
                  </p>
                  <p className="text-xl mb-8 text-white">{scenarios[currentScenario].question}</p>
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="default"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleAnswer(true)}
                  >
                    Yes, Share
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleAnswer(false)}
                  >
                    No, Don't Share
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
