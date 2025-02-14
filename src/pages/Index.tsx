
import { ArrowRight, ShieldCheck, Lock, Bug, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Phishing Frenzy",
    description: "Learn to identify and avoid suspicious emails",
    icon: AlertTriangle,
    color: "text-alertRed",
  },
  {
    title: "Password Protector",
    description: "Master the art of secure password creation",
    icon: Lock,
    color: "text-matrix",
  },
  {
    title: "Malware Defense",
    description: "Protect against digital threats",
    icon: Bug,
    color: "text-electricBlue",
  },
  {
    title: "Security Shield",
    description: "Build your digital fortress",
    icon: ShieldCheck,
    color: "text-matrix",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const handleFeatureClick = (levelId: number) => {
    if (isAuthenticated) {
      navigate(`/level/${levelId}`);
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen matrix-bg">
      <main className="container mx-auto px-4 py-16">
        <div className="absolute top-4 right-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
            className="text-white"
          >
            {isAuthenticated ? "Dashboard" : "Login"}
          </Button>
        </div>

        <section className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-matrix font-cyber text-sm uppercase tracking-wider mb-4 inline-block px-4 py-1 rounded-full border border-matrix/20">
              Welcome to Digital Safeguard
            </span>
            <h1 className="text-4xl md:text-6xl font-bold font-cyber mb-6 text-lightGrey animate-text-glow">
              Master Cybersecurity
              <br /> Through Interactive Learning
            </h1>
            <p className="text-lg md:text-xl text-lightGrey/80 max-w-2xl mx-auto mb-8">
              Embark on a journey through our gamified cybersecurity challenges.
              Learn real-world skills while having fun.
            </p>
            <button 
              onClick={() => navigate("/auth")}
              className="bg-matrix text-deepBlack font-bold px-8 py-3 rounded-lg hover:bg-matrix/90 transition-all duration-300 inline-flex items-center gap-2 glow-effect"
            >
              Start Training <ArrowRight size={20} />
            </button>
          </motion.div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-xl bg-deepBlack/50 border border-matrix/10 card-hover backdrop-blur-sm cursor-pointer"
              onClick={() => handleFeatureClick(index + 1)}
            >
              <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
              <h3 className="text-xl font-cyber font-bold mb-2 text-lightGrey">
                {feature.title}
              </h3>
              <p className="text-lightGrey/70">{feature.description}</p>
            </motion.div>
          ))}
        </section>

        <section className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-cyber font-bold mb-8 text-lightGrey">
              Your Journey to Digital Safety
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl bg-deepBlack/30 border border-matrix/10 spider-web">
                <h3 className="text-xl font-cyber font-bold mb-4 text-matrix">
                  Learn
                </h3>
                <p className="text-lightGrey/70">
                  Interactive lessons and real-world scenarios
                </p>
              </div>
              <div className="p-6 rounded-xl bg-deepBlack/30 border border-matrix/10 spider-web">
                <h3 className="text-xl font-cyber font-bold mb-4 text-matrix">
                  Practice
                </h3>
                <p className="text-lightGrey/70">
                  Hands-on challenges and simulations
                </p>
              </div>
              <div className="p-6 rounded-xl bg-deepBlack/30 border border-matrix/10 spider-web">
                <h3 className="text-xl font-cyber font-bold mb-4 text-matrix">
                  Master
                </h3>
                <p className="text-lightGrey/70">
                  Earn badges and track your progress
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default Index;
