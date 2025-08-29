import { Button } from "@/components/ui/button";
import { MessageCircle, Heart, Shield, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-wellness.jpg";

const Hero = () => {
  const navigate = useNavigate();

  const handleNavigateToTherapist = () => {
    navigate('/ai-therapist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-calm py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-primary-soft/50 px-4 py-2 rounded-full">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Completely Private & Confidential</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                Mental wellness
                <br />
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  made safe & accessible
                </span>
                <br />
                for Indian youth
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg">
                Chat with our AI therapist, access guided meditations, and get culturally-aware support 
                — all designed to understand your unique challenges as a young Indian.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="hero" 
                size="lg" 
                className="group"
                onClick={handleNavigateToTherapist}
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Start Free Chat
              </Button>
              <a href="#features">
                <Button variant="soft" size="lg">
                  <Sparkles className="w-5 h-5" />
                  Learn More
                </Button>
              </a>
            </div>

            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-healing" />
                <span>No judgment</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-calm" />
                <span>100% Anonymous</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-saffron" />
                <span>24/7 Available</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="animate-float">
              <img 
                src={heroImage} 
                alt="Young Indian people in a supportive, peaceful environment representing mental wellness"
                className="rounded-2xl shadow-strong w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-healing-soft p-4 rounded-2xl shadow-medium animate-pulse-soft">
              <div className="text-healing font-semibold">1000+</div>
              <div className="text-sm text-muted-foreground">Youth Supported</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;