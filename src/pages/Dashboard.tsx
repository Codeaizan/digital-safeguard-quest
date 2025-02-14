
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

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
      .from('leaderboard')
      .select('username, avatar_url, user_id, total_score, levels_completed')
      .order('total_score', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error("Error fetching leaderboard:", error);
      return;
    }
    
    if (data) {
      const typedData: LeaderboardEntry[] = data.map(entry => ({
        username: entry.username,
        avatar_url: entry.avatar_url,
        user_id: entry.user_id,
        total_score: Number(entry.total_score),
        levels_completed: Number(entry.levels_completed)
      }));
      setLeaderboard(typedData);
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
    return progress.reduce((total, p) => total + (p.score || 0), 0);
  };

  const handleResetScores = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("user_progress")
      .delete()
      .eq('user_id', session.user.id);

    if (error) {
      console.error("Error resetting scores:", error);
      toast({
        title: "Error",
        description: "Failed to reset scores. Please try again.",
        variant: "destructive"
      });
      return;
    }

    // Clear progress from state after successful delete
    setProgress([]);
    
    toast({
      title: "Success",
      description: "All your scores have been reset!",
    });

    // Refresh leaderboard if it's showing
    if (showLeaderboard) {
      fetchLeaderboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-matrix">Cybersecurity Training</h1>
          <div className="space-x-4">
            <Button onClick={toggleLeaderboard} variant="outline" className="hover:bg-matrix/20">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </Button>
            <Button onClick={handleResetScores} variant="outline" className="hover:bg-yellow-500/20">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Scores
            </Button>
            <Button onClick={handleLogout} variant="outline" className="hover:bg-red-500/20">
              Logout
            </Button>
          </div>
        </div>

        {showLeaderboard ? (
          <Card className="bg-gray-800 border-matrix/20">
            <CardHeader>
              <CardTitle className="text-matrix">Top Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg backdrop-blur-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-xl font-bold">
                        {index === 0 && "🥇"}
                        {index === 1 && "🥈"}
                        {index === 2 && "🥉"}
                        {index > 2 && `#${index + 1}`}
                      </span>
                      <div>
                        <p className="font-semibold text-matrix">{entry.username || "Anonymous Player"}</p>
                        <p className="text-sm text-gray-400">{entry.levels_completed} levels completed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-matrix">{entry.total_score}</p>
                      <p className="text-sm text-gray-400">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-8 bg-gray-800 border-matrix/20">
              <CardHeader>
                <CardTitle className="text-matrix">Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">Total Score: {getTotalScore()}</p>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {levels.map((level) => {
                const levelProgress = progress.find(p => p.level_id === level.id);
                return (
                  <Card key={level.id} className="bg-gray-800 border-matrix/20 hover:border-matrix/50 transition-all">
                    <CardHeader>
                      <CardTitle className="text-matrix">{level.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-gray-300">{level.description}</p>
                      <p className="mb-4 text-matrix">
                        Score: {levelProgress?.score || 0} / {level.max_points}
                      </p>
                      <Button
                        onClick={() => navigate(`/level/${level.id}`)}
                        className="w-full bg-matrix/20 hover:bg-matrix/40 text-matrix"
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
