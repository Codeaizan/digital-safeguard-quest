import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal } from "lucide-react";

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

interface LeaderboardEntry {
  username: string | null;
  avatar_url: string | null;
  total_score: number;
  levels_completed: number;
  user_id: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [levels, setLevels] = useState<Level[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

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

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .rpc('get_leaderboard')
      .limit(10);
    
    if (error) {
      console.error("Error fetching leaderboard:", error);
      return;
    }
    
    if (data) {
      setLeaderboard(data as LeaderboardEntry[]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const toggleLeaderboard = async () => {
    if (!showLeaderboard) {
      await fetchLeaderboard();
    }
    setShowLeaderboard(!showLeaderboard);
  };

  const getTotalScore = () => {
    return progress.reduce((total, p) => total + p.score, 0);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Cybersecurity Training</h1>
          <div className="space-x-4">
            <Button onClick={toggleLeaderboard} variant="outline">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        {showLeaderboard ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Top Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-xl font-bold">
                        {index === 0 && "🥇"}
                        {index === 1 && "🥈"}
                        {index === 2 && "🥉"}
                        {index > 2 && `#${index + 1}`}
                      </span>
                      <div>
                        <p className="font-semibold">{entry.username || "Anonymous Player"}</p>
                        <p className="text-sm text-gray-500">{entry.levels_completed} levels completed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{entry.total_score}</p>
                      <p className="text-sm text-gray-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
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
                        onClick={() => navigate(`/level/${level.id}`)}
                        className="w-full"
                      >
                        {levelProgress?.completed ? "Retry Level" : "Start Level"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
