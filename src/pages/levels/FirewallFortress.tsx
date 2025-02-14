
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, AlertTriangle } from "lucide-react";

interface TrafficRule {
  id: number;
  type: string;
  source: string;
  port: number;
  protocol: string;
  risk: "high" | "medium" | "low";
  shouldBlock: boolean;
}

const trafficRules: TrafficRule[] = [
  {
    id: 1,
    type: "Web Traffic",
    source: "203.0.113.42",
    port: 443,
    protocol: "HTTPS",
    risk: "low",
    shouldBlock: false
  },
  {
    id: 2,
    type: "Email",
    source: "198.51.100.77",
    port: 25,
    protocol: "SMTP",
    risk: "medium",
    shouldBlock: true
  },
  {
    id: 3,
    type: "File Download",
    source: "192.0.2.15",
    port: 21,
    protocol: "FTP",
    risk: "high",
    shouldBlock: true
  },
  {
    id: 4,
    type: "Web Traffic",
    source: "203.0.113.54",
    port: 80,
    protocol: "HTTP",
    risk: "medium",
    shouldBlock: true
  },
  {
    id: 5,
    type: "API Request",
    source: "203.0.113.128",
    port: 443,
    protocol: "HTTPS",
    risk: "low",
    shouldBlock: false
  }
];

export default function FirewallFortress() {
  const [blockedTraffic, setBlockedTraffic] = useState<number[]>([]);
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

  const toggleTrafficBlock = (id: number) => {
    setBlockedTraffic(prev =>
      prev.includes(id)
        ? prev.filter(ruleId => ruleId !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    let points = 10;
    const mistakes = trafficRules.filter(rule => 
      (rule.shouldBlock && !blockedTraffic.includes(rule.id)) ||
      (!rule.shouldBlock && blockedTraffic.includes(rule.id))
    ).length;

    points = Math.max(0, points - mistakes);
    setScore(points);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("user_progress")
      .upsert({
        user_id: session.user.id,
        level_id: 6,
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

  const getRiskColor = (risk: "high" | "medium" | "low") => {
    switch (risk) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-800 border-matrix/20">
          <CardHeader>
            <CardTitle className="text-matrix flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Level 6: Firewall Fortress
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
                  Configure the firewall by blocking suspicious traffic. Analyze each request and decide whether to allow or block it.
                </p>
                <div className="space-y-4">
                  {trafficRules.map((rule) => (
                    <Card
                      key={rule.id}
                      className={`transition-colors ${
                        blockedTraffic.includes(rule.id)
                          ? "bg-red-900/20 border-red-500/50"
                          : "bg-gray-700/50 border-gray-600"
                      }`}
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="space-y-1">
                          <h3 className="font-bold text-matrix">{rule.type}</h3>
                          <p className="text-sm text-gray-300">Source: {rule.source}</p>
                          <p className="text-sm text-gray-300">
                            Port: {rule.port} ({rule.protocol})
                          </p>
                          <p className={`text-sm font-semibold ${getRiskColor(rule.risk)}`}>
                            Risk Level: {rule.risk.toUpperCase()}
                          </p>
                        </div>
                        <Button
                          variant={blockedTraffic.includes(rule.id) ? "destructive" : "outline"}
                          onClick={() => toggleTrafficBlock(rule.id)}
                          className="min-w-[100px]"
                        >
                          {blockedTraffic.includes(rule.id) ? (
                            <>
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Blocked
                            </>
                          ) : (
                            "Block"
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button 
                  onClick={handleSubmit}
                  className="w-full bg-matrix/20 hover:bg-matrix/40 text-matrix"
                >
                  Apply Firewall Rules
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
