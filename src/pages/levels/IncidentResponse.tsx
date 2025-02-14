
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Step {
  id: number;
  title: string;
  description: string;
  options: {
    id: string;
    text: string;
    correct: boolean;
  }[];
  completed: boolean;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Identification",
    description: "A user reports that sensitive customer data has been accessed by an unauthorized party. What's your first step?",
    options: [
      { id: "1a", text: "Immediately shut down all systems", correct: false },
      { id: "1b", text: "Document the initial report and gather evidence", correct: true },
      { id: "1c", text: "Call the police", correct: false },
      { id: "1d", text: "Email all customers about the breach", correct: false }
    ],
    completed: false
  },
  {
    id: 2,
    title: "Containment",
    description: "You've confirmed a data breach. What's your immediate containment strategy?",
    options: [
      { id: "2a", text: "Delete all affected files", correct: false },
      { id: "2b", text: "Isolate affected systems and change all passwords", correct: true },
      { id: "2c", text: "Install new antivirus software", correct: false },
      { id: "2d", text: "Continue normal operations while investigating", correct: false }
    ],
    completed: false
  },
  {
    id: 3,
    title: "Eradication",
    description: "How do you ensure the threat is eliminated?",
    options: [
      { id: "3a", text: "Only remove malware from affected systems", correct: false },
      { id: "3b", text: "Restore from backup without checking for vulnerabilities", correct: false },
      { id: "3c", text: "Comprehensive security audit and patch all vulnerabilities", correct: true },
      { id: "3d", text: "Replace all computers", correct: false }
    ],
    completed: false
  },
  {
    id: 4,
    title: "Recovery",
    description: "What's the best approach to restore operations?",
    options: [
      { id: "4a", text: "Immediately restore all systems to full operation", correct: false },
      { id: "4b", text: "Gradually restore with monitoring and testing", correct: true },
      { id: "4c", text: "Only restore critical systems", correct: false },
      { id: "4d", text: "Start fresh with new systems", correct: false }
    ],
    completed: false
  },
  {
    id: 5,
    title: "Lessons Learned",
    description: "How do you prevent future incidents?",
    options: [
      { id: "5a", text: "Only focus on technical improvements", correct: false },
      { id: "5b", text: "Fire the responsible employees", correct: false },
      { id: "5c", text: "Document incident and update security policies", correct: true },
      { id: "5d", text: "Invest in new security products only", correct: false }
    ],
    completed: false
  }
];

export default function IncidentResponse() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
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

  const handleOptionSelect = async (value: string) => {
    const step = steps[currentStep];
    const selectedOption = step.options.find(opt => opt.id === value);
    
    if (!selectedOption) return;

    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentStep] = value;
    setSelectedOptions(newSelectedOptions);

    if (selectedOption.correct) {
      if (currentStep === steps.length - 1) {
        // Calculate final score based on correct answers
        const correctAnswers = newSelectedOptions.filter((optionId, index) => {
          const stepOptions = steps[index].options;
          const selected = stepOptions.find(opt => opt.id === optionId);
          return selected?.correct;
        }).length;

        const finalScore = Math.floor((correctAnswers / steps.length) * 10);
        setScore(finalScore);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { error } = await supabase
          .from("user_progress")
          .upsert({
            user_id: session.user.id,
            level_id: 10,
            score: finalScore,
            completed: true,
          }, {
            onConflict: 'user_id,level_id'
          });

        if (error) {
          console.error("Error updating progress:", error);
          toast({
            title: "Error",
            description: "Failed to save progress. Please try again.",
            variant: "destructive"
          });
          return;
        }

        setCompleted(true);
        toast({
          title: "Level Complete!",
          description: `You scored ${finalScore} points!`,
        });
      } else {
        setCurrentStep(prev => prev + 1);
        toast({
          title: "Correct!",
          description: "Moving to next step...",
        });
      }
    } else {
      toast({
        title: "Incorrect",
        description: "Try again!",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-gray-800 border-matrix/20">
          <CardHeader>
            <CardTitle className="text-matrix flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Level 10: Incident Response Simulator
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
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-matrix">
                    {steps[currentStep].title}
                  </h2>
                  <p className="text-gray-300">
                    {steps[currentStep].description}
                  </p>
                </div>

                <RadioGroup
                  onValueChange={handleOptionSelect}
                  className="space-y-3"
                >
                  {steps[currentStep].options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2 rounded-lg border border-gray-700 p-4 hover:bg-gray-700/50 transition-colors"
                    >
                      <RadioGroupItem
                        value={option.id}
                        id={option.id}
                        className="border-matrix text-matrix"
                      />
                      <Label
                        htmlFor={option.id}
                        className="flex-1 cursor-pointer text-gray-300"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                  {selectedOptions[currentStep] && (
                    <div className="flex items-center gap-2">
                      {steps[currentStep].options.find(
                        opt => opt.id === selectedOptions[currentStep]
                      )?.correct ? (
                        <CheckCircle2 className="text-green-500 h-5 w-5" />
                      ) : (
                        <AlertCircle className="text-red-500 h-5 w-5" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
