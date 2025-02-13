
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Level {
  id: number;
  name: string;
  description: string;
  max_points: number;
}

interface UserProgress {
  level_id: number;
  score: number;
  completed: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [levels, setLevels] = useState<Level[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);

  useEffect(() => {
    checkUser();
    fetchLevels();
    fetchProgress();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchLevels = async () => {
    const { data, error } = await supabase
      .from("levels")
      .select("*")
      .order("id");
    
    if (error) {
      console.error("Error fetching levels:", error);
      return;
    }
    
    setLevels(data);
  };

  const fetchProgress = async () => {
    const { data, error } = await supabase
      .from("user_progress")
      .select("*");
    
    if (error) {
      console.error("Error fetching progress:", error);
      return;
    }
    
    setProgress(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const startLevel = (levelId: number) => {
    navigate(`/level/${levelId}`);
  };

  const getTotalScore = () => {
    return progress.reduce((total, p) => total + p.score, 0);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Cybersecurity Training</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">Total Score: {getTotalScore()}</p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {levels.map((level) => {
            const levelProgress = progress.find(p => p.level_id === level.id);
            return (
              <Card key={level.id}>
                <CardHeader>
                  <CardTitle>{level.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{level.description}</p>
                  <p className="mb-4">
                    Score: {levelProgress?.score || 0} / {level.max_points}
                  </p>
                  <Button
                    onClick={() => startLevel(level.id)}
                    className="w-full"
                  >
                    {levelProgress?.completed ? "Retry Level" : "Start Level"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
