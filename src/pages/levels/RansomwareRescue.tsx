
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ShieldAlert, AlertTriangle, HardDrive, Wifi, WifiOff } from "lucide-react";
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
    title: "Initial Response",
    description: "Your computer screen shows a message demanding Bitcoin payment to unlock your files. What's your first action?",
    options: [
      { id: "1a", text: "Pay the ransom immediately", correct: false },
      { id: "1b", text: "Disconnect from the network", correct: true },
      { id: "1c", text: "Try to unlock files manually", correct: false },
      { id: "1d", text: "Continue working on other tasks", correct: false }
    ],
    completed: false
  },
  {
    id: 2,
    title: "System Analysis",
    description: "You need to understand the scope of the infection. What should you check first?",
    options: [
      { id: "2a", text: "Browse the internet for solutions", correct: false },
      { id: "2b", text: "Run a system scan", correct: false },
      { id: "2c", text: "Check which files are encrypted", correct: true },
      { id: "2d", text: "Delete suspicious files", correct: false }
    ],
    completed: false
  },
  {
    id: 3,
    title: "Data Recovery",
    description: "How do you recover your files?",
    options: [
      { id: "3a", text: "Restore from offline backup", correct: true },
      { id: "3b", text: "Use online recovery tools", correct: false },
      { id: "3c", text: "Negotiate with attackers", correct: false },
      { id: "3d", text: "Format the system", correct: false }
    ],
    completed: false
  },
  {
    id: 4,
    title: "Prevention",
    description: "What step should you take to prevent future attacks?",
    options: [
      { id: "4a", text: "Install more antivirus programs", correct: false },
      { id: "4b", text: "Never open any email attachments", correct: false },
      { id: "4c", text: "Set up regular offline backups", correct: true },
      { id: "4d", text: "Disable all network connections", correct: false }
    ],
    completed: false
  }
];

export default function RansomwareRescue() {
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
            level_id: 9,
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
              Level 9: Ransomware Rescue
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
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
