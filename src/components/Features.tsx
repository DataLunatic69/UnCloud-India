import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Headphones, Sparkles, Heart, Shield, MapPin, BookOpen, TrendingUp, ArrowRight, Play, Star, Users2, Check, Zap, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const Features = () => {
  const navigate = useNavigate();
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);

  const handleNavigation = (link: string) => {
    navigate(link);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    {
      icon: MessageCircle,
      title: "AI Therapist Chat",
      description: "Get personalized therapy with AI that understands Indian cultural contexts and family dynamics.",
      longDescription: "Experience 24/7 empathetic conversations powered by advanced AI trained on CBT/DBT techniques specifically adapted for Indian youth facing family pressure, academic stress, and cultural challenges.",
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-600",
      link: "/ai-therapist",
      stats: "10K+ conversations",
      badge: null,
      highlights: ["24/7 Available", "Cultural Sensitivity", "Evidence-Based CBT/DBT"],
      popularity: 95
    },
    {
      icon: Headphones,
      title: "AI Meditations",
      description: "Personalized guided meditation sessions for study focus, exam stress, and peaceful sleep.",
      longDescription: "Access hundreds of AI-generated meditation sessions tailored to your specific needs - whether it's exam anxiety, family conflicts, or sleep troubles. Each session adapts to your emotional state.",
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-600",
      link: "/ai-meditations",
      stats: "500+ unique sessions",
      badge: null,
      highlights: ["Personalized Content", "Study Focus", "Sleep Enhancement"],
      popularity: 87
    },
    {
      icon: Sparkles,
      title: "AI Affirmations",
      description: "Daily personalized affirmations that resonate with Indian family dynamics and values.",
      longDescription: "Receive culturally-aware daily affirmations that understand the unique challenges of Indian youth - from family expectations to career pressures, crafted with cultural sensitivity.",
      color: "from-amber-500 to-orange-600",
      textColor: "text-amber-600",
      link: "/ai-affirmations",
      stats: "Fresh daily content",
      badge: null,
      highlights: ["Daily Updates", "Cultural Context", "Motivation Boost"],
      popularity: 78
    },
    {
      icon: Heart,
      title: "Stigma Support & Crisis Care",
      description: "Comprehensive support with AI crisis detection and immediate emergency assistance.",
      longDescription: "Break through mental health stigma with our dual-layer support system. Get guidance for family acceptance plus AI-powered crisis detection that connects you to immediate professional help.",
      color: "from-rose-500 to-pink-600",
      textColor: "text-rose-600",
      link: "/stigma-support",
      stats: "24/7 crisis support",
      badge: null,
      highlights: ["Crisis Detection", "Emergency Resources", "Stigma Breaking"],
      popularity: 92
    },
    {
      icon: BookOpen,
      title: "Myth Buster",
      description: "Debunk mental health myths with evidence-based facts and expert explanations.",
      longDescription: "Combat misinformation with clinician-reviewed content that addresses common mental health myths prevalent in Indian society, providing scientific explanations and cultural context.",
      color: "from-purple-500 to-violet-600",
      textColor: "text-purple-600",
      link: "/myth-buster",
      stats: "100+ myths debunked",
      badge: null,
      highlights: ["Evidence-Based", "Expert Reviewed", "Cultural Myths"],
      popularity: 73
    },
    {
      icon: TrendingUp,
      title: "Mood Tracking",
      description: "Track your emotional journey with intelligent mood analysis and pattern recognition.",
      longDescription: "Understand your emotional patterns with advanced AI analysis. Track mood changes, identify triggers, and monitor your mental health progress while maintaining complete privacy.",
      color: "from-indigo-500 to-blue-600",
      textColor: "text-indigo-600",
      link: "/mood-tracking",
      stats: "Advanced analytics",
      badge: null,
      highlights: ["Pattern Recognition", "Privacy Protected", "Progress Insights"],
      popularity: 89
    },
    {
      icon: MapPin,
      title: "Local Resources",
      description: "Find verified mental health professionals and support groups in your area.",
      longDescription: "Discover qualified therapists, psychiatrists, support groups, and emergency resources near you. Get verified contacts, reviews, and specialized services based on your location.",
      color: "from-cyan-500 to-teal-600",
      textColor: "text-cyan-600",
      link: "/local-resources",
      stats: "1000+ verified resources",
      badge: null,
      highlights: ["Location-Based", "Verified Professionals", "Emergency Contacts"],
      popularity: 81
    }
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.1),transparent_70%)]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 via-purple-50 to-pink-100 rounded-full mb-8 border border-blue-200/50">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">7 Comprehensive AI Features</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
              Mental Health
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
              Reimagined
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
            Experience the future of mental wellness with our comprehensive suite of AI-powered tools, 
            meticulously designed for Indian youth facing unique cultural and social challenges.
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
              <Zap className="w-4 h-4 text-blue-500" />
              <span>AI-Powered Features</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Culturally Sensitive</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Privacy Protected</span>
            </div>
          </div>
        </div>

        {/* Features Showcase */}
        <div className="space-y-16">
          {/* All Features in Equal Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isExpanded = selectedFeature === index;
              
              return (
                <Card
                  key={index}
                  data-feature-index={index}
                  className={cn(
                    "group relative overflow-hidden border border-gray-100 shadow-md hover:shadow-lg transition-all duration-500 bg-white/95 backdrop-blur-sm cursor-pointer h-full",
                    isExpanded && "ring-2 ring-blue-200/50 shadow-lg"
                  )}
                  onClick={() => setSelectedFeature(isExpanded ? null : index)}
                >
                  {/* Gradient Background */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500",
                    feature.color
                  )} />
                  
                  {/* Popular Badge */}
                  {feature.badge && (
                    <div className="absolute -top-2 -right-2 z-20">
                      <Badge
                        className={cn(
                          "text-xs font-bold px-3 py-1 shadow-lg",
                          feature.badge === "Most Popular" && "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
                          feature.badge === "New" && "bg-gradient-to-r from-green-400 to-emerald-500 text-white",
                          feature.badge === "Critical" && "bg-gradient-to-r from-red-500 to-pink-600 text-white",
                          feature.badge === "AI Powered" && "bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
                        )}
                      >
                        {feature.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="py-3 px-3 relative z-10">
                    {/* Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl bg-gradient-to-br mb-3 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg",
                      feature.color
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Title */}
                    <CardTitle className="text-base font-bold text-center mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                      {feature.title}
                    </CardTitle>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-1">
                      <span>{feature.stats}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 pb-3 px-4 relative z-10 flex flex-col h-full justify-between space-y-3">
                    {/* Description */}
                    <div className="flex flex-col space-y-3">
                      <p className="text-gray-600 text-center leading-tight text-sm">
                        {isExpanded ? feature.longDescription : feature.description}
                      </p>

                      {/* Arrow Button and Highlights in expanded mode */}
                      {isExpanded && (
                        <>
                          <div className="flex justify-center">
                            <Button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigation(feature.link);
                              }}
                              className={cn(
                                "rounded-full w-10 h-10 p-0 flex items-center justify-center bg-gradient-to-r text-white border-0 shadow-md z-20 relative",
                                feature.color
                              )}
                              size="icon"
                            >
                              <ArrowRight className="w-5 h-5" />
                            </Button>
                          </div>
                          
                          <div className="space-y-1 mt-1">
                            {feature.highlights.map((highlight, i) => (
                              <div key={i} className="flex items-center gap-1 text-xs text-gray-600">
                                <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                                <span>{highlight}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-1">
                      {/* Main action buttons */}
                      <div className="flex gap-2">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click event
                            handleNavigation(feature.link);
                          }}
                          className={cn(
                            "flex-1 shadow-sm transition-all duration-300 bg-gradient-to-r text-white border-0 font-medium z-20 relative",
                            feature.color,
                            "hover:brightness-110 hover:shadow-md"
                          )}
                          size="sm"
                        >
                          <span>Get Started</span>
                          <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isExpanded) {
                              setSelectedFeature(null);
                            } else {
                              setSelectedFeature(index);
                            }
                          }}
                          className="flex-1 text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {isExpanded ? 'Show Less' : 'Learn More'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-24">
          <div className="max-w-4xl mx-auto p-12 bg-gradient-hero backdrop-blur-sm rounded-3xl text-white shadow-2xl border border-white/10">
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  Transform Your Mental Health Today
                </h3>
                <p className="text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                  Experience personalized mental health support designed specifically for Indian youth with our comprehensive AI-powered platform.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  onClick={() => handleNavigation('/ai-therapist')}
                  className="bg-white text-teal-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg px-8 py-4"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Start Free Therapy Session
                </Button>
                <Button 
                  size="lg" 
                  onClick={() => handleNavigation('/ai-meditations')}
                  className="bg-white/20 border-2 border-white text-white hover:bg-white hover:text-teal-600 font-bold text-lg px-8 py-4 transition-all duration-300 backdrop-blur-sm"
                >
                  <Headphones className="w-5 h-5 mr-2" />
                  Try Guided Meditation
                </Button>
              </div>
              
              <p className="text-sm text-white/80">
                ✨ No credit card required • 🔒 Complete privacy guaranteed • 🌟 Culturally sensitive support
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;