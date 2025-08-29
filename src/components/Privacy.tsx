import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, Trash2, Download, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
  const privacyFeatures = [
    {
      icon: Shield,
      title: "Anonymous by Default",
      description: "No real names required. Your identity stays completely private.",
    },
    {
      icon: Lock,
      title: "Local Data Storage",
      description: "Your conversations are stored securely on servers in India, not shared with third parties.",
    },
    {
      icon: Eye,
      title: "Granular Controls",
      description: "Choose what to remember, what to forget. Turn off memory anytime.",
    },
    {
      icon: Trash2,
      title: "Right to Delete",
      description: "Delete individual messages, entire conversations, or your complete account instantly.",
    },
    {
      icon: Download,
      title: "Data Export",
      description: "Download all your data in a readable format whenever you want.",
    },
    {
      icon: Settings,
      title: "Your Consent Matters",
      description: "Clear permissions for every feature. No hidden data collection.",
    },
  ];

  return (
    <section id="privacy" className="py-20 bg-gradient-calm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-primary-soft/50 px-4 py-2 rounded-full mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Privacy-First Design</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Your privacy is 
            <br />
            <span className="bg-gradient-hero bg-clip-text text-transparent">non-negotiable</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We understand the importance of confidentiality in mental health. 
            That's why we've built the strongest privacy protections from day one.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {privacyFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-card/80 backdrop-blur-sm shadow-soft hover:shadow-medium transition-smooth">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary-soft rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-medium">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground">Not a Medical Device</h3>
              <p className="text-muted-foreground">
                Uncloud India provides psychoeducation and self-help support. We are not a substitute 
                for professional medical care. In crisis situations, we connect you with local emergency resources.
              </p>
              <p className="text-sm text-muted-foreground">
                Our AI is designed to recognize when professional help is needed and will guide you 
                to appropriate local resources with your consent.
              </p>
            </div>
            <div className="text-center md:text-right">
              <Link to="/privacy">
                <Button variant="soft" size="lg">
                  Read Full Privacy Policy
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Privacy;