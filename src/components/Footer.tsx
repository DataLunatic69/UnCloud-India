import { Heart, Shield, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Uncloud India</span>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              AI-powered mental wellness platform designed for Indian youth. 
              Safe, private, culturally-aware support available 24/7.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/ai-therapist" className="hover:opacity-100 transition-opacity">AI Therapist Chat</Link></li>
              <li><Link to="/ai-meditations" className="hover:opacity-100 transition-opacity">Guided Meditations</Link></li>
              <li><Link to="/ai-affirmations" className="hover:opacity-100 transition-opacity">Daily Affirmations</Link></li>
              <li><Link to="/mood-tracking" className="hover:opacity-100 transition-opacity">Mood Tracking</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link></li>
              <li><Link to="/local-resources" className="hover:opacity-100 transition-opacity">Crisis Resources</Link></li>
              <li><Link to="/local-resources" className="hover:opacity-100 transition-opacity">Local Professionals</Link></li>
              <li><Link to="/stigma-support" className="hover:opacity-100 transition-opacity">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Crisis Support</h4>
            <div className="space-y-3">
              <div className="p-3 bg-healing/20 rounded-lg border border-healing/30">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="w-4 h-4 text-healing" />
                  <span className="text-sm font-medium">24/7 Helpline</span>
                </div>
                <div className="text-lg font-bold text-healing">1800-599-0019</div>
                <div className="text-xs opacity-70">AASRA Suicide Prevention</div>
              </div>
              <Link to="/local-resources">
                <Button variant="healing" size="sm" className="w-full">
                  Find Local Resources
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm opacity-70">
            © 2024 Uncloud India. Made with ❤️ for mental wellness.
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-healing" />
              <span>Open Source</span>
            </div>
            <div className="text-opacity-70">•</div>
            <div>Made in India</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;