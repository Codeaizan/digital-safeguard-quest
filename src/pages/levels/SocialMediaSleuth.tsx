
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Eye, EyeOff, Shield } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface PrivacyItem {
  id: number;
  type: string;
  content: string;
  isPrivate: boolean;
  shouldBePrivate: boolean;
  category: "personal" | "location" | "financial" | "plans";
}

const privacyItems: PrivacyItem[] = [
  {
    id: 1,
    type: "Phone Number",
    content: "+1 (555) 123-4567",
    isPrivate: false,
    shouldBePrivate: true,
    category: "personal"
  },
  {
    id: 2,
    type: "Home Address",
    content: "123 Main St, Anytown, USA",
    isPrivate: false,
    shouldBePrivate: true,
    category: "location"
  },
  {
    id: 3,
    type: "Vacation Plans",
    content: "Going to Hawaii next week! House will be empty!",
    isPrivate: false,
    shouldBePrivate: true,
    category: "plans"
  },
  {
    id: 4,
    type: "Work Info",
    content: "Software Engineer at Tech Corp",
    isPrivate: false,
    shouldBePrivate: false,
    category: "personal"
  },
  {
    id: 5,
    type: "Bank Details",
    content: "Account #1234 at City Bank",
    isPrivate: false,
    shouldBePrivate: true,
    category: "financial"
  },
  {
    id: 6,
    type: "Education",
    content: "Graduated from State University",
    isPrivate: false,
    shouldBePrivate: false,
    category: "personal"
  },
  {
    id: 7,
    type: "Birthday Plans",
    content: "Party at Joe's Bar this Saturday!",
    isPrivate: false,
    shouldBePrivate: false,
    category: "plans"
  },
  {
    id: 8,
    type: "Credit Card",
    content: "Just got my new Visa card!",
    isPrivate: false,
    shouldBePrivate: true,
    category: "financial"
  }
];

export default function SocialMediaSleuth() {
  const [privateItems, setPrivateItems] = useState<number[]>([]);
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

  const togglePrivacy = (id: number) => {
    setPrivateItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    let points = 10;
    const mistakes = privacyItems.filter(item => 
      (item.shouldBePrivate && !privateItems.includes(item.id)) ||
      (!item.shouldBePrivate && privateItems.includes(item.id))
    ).length;

    points = Math.max(0, points - mistakes);
    setScore(points);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("user_progress")
      .upsert({
        user_id: session.user.id,
        level_id: 8,
        score: points,
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
      description: `You scored ${points} points!`,
    });
  };

  const getCategoryIcon = (category: PrivacyItem["category"]) => {
    switch (category) {
      case "personal":
        return <User className="h-4 w-4 text-blue-400" />;
      case "location":
        return <Shield className="h-4 w-4 text-green-400" />;
      case "financial":
        return <Shield className="h-4 w-4 text-red-400" />;
      case "plans":
        return <Eye className="h-4 w-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-800 border-matrix/20">
          <CardHeader>
            <CardTitle className="text-matrix flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Level 8: Social Media Sleuth
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
                <p className="text-gray-300">
                  Review the social media profile and set appropriate privacy settings for each piece of information.
                  Toggle visibility to private for sensitive information that shouldn't be public.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {privacyItems.map((item) => (
                    <Card
                      key={item.id}
                      className={`transition-colors ${
                        privateItems.includes(item.id)
                          ? "bg-gray-700/50 border-matrix/50"
                          : "bg-gray-700/20 border-gray-600"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(item.category)}
                            <h3 className="font-bold text-matrix">{item.type}</h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePrivacy(item.id)}
                            className={privateItems.includes(item.id) ? "text-matrix" : "text-gray-400"}
                          >
                            {privateItems.includes(item.id) ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="mt-2 text-sm text-gray-300">{item.content}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Checkbox
                            checked={privateItems.includes(item.id)}
                            onCheckedChange={() => togglePrivacy(item.id)}
                            className="data-[state=checked]:bg-matrix data-[state=checked]:border-matrix"
                          />
                          <label className="text-sm text-gray-400">
                            Set as Private
                          </label>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-matrix/20 hover:bg-matrix/40 text-matrix"
                >
                  Update Privacy Settings
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
