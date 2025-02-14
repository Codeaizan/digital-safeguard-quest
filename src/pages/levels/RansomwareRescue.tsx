
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