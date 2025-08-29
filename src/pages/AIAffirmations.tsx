import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowLeft, RefreshCw, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAI } from '@/hooks/useAI';
import { useApp } from '@/contexts/AppContext';

const AIAffirmations = () => {
  const [currentAffirmation, setCurrentAffirmation] = useState('');
  const [userContext, setUserContext] = useState('');
  const [streak, setStreak] = useState(0);
  const { getPersonalizedAffirmation, getRandomAffirmation, isLoading } = useAI();
  const { state, dispatch } = useApp();

  // Load initial affirmation
  useEffect(() => {
    loadNewAffirmation();
  }, []);

  // Calculate streak (simplified - consecutive days with affirmations)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const recentAffirmations = state.affirmations.filter(aff => {
      // In a real app, we'd store timestamps with affirmations
      return true; // Simplified for demo
    });
    setStreak(Math.min(recentAffirmations.length, 30)); // Cap at 30 for display
  }, [state.affirmations]);

  const loadNewAffirmation = async () => {
    try {
      const affirmation = userContext.trim() 
        ? await getPersonalizedAffirmation(userContext)
        : getRandomAffirmation();
      setCurrentAffirmation(affirmation);
    } catch (error) {
      console.error('Failed to load affirmation:', error);
      setCurrentAffirmation(getRandomAffirmation());
    }
  };

  const saveAffirmation = () => {
    if (currentAffirmation) {
      dispatch({ type: 'ADD_AFFIRMATION', payload: currentAffirmation });
    }
  };

  const handlePersonalize = async () => {
    if (!userContext.trim()) return;
    
    try {
      const affirmation = await getPersonalizedAffirmation(userContext);
      setCurrentAffirmation(affirmation);
    } catch (error) {
      console.error('Failed to personalize affirmation:', error);
    }
  };

  const contextSuggestions = [
    'exam stress', 'family pressure', 'self-confidence', 'academic performance',
    'social anxiety', 'career worries', 'body image', 'relationships'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-saffron" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">AI Affirmations</h1>
                <p className="text-sm text-muted-foreground">Personalized positive reinforcements</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Affirmation Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Affirmation */}
            <Card className="shadow-soft border-primary/20 bg-gradient-subtle">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Sparkles className="w-12 h-12 text-saffron mx-auto mb-4" />
                  <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                    Today's Affirmation
                  </h2>
                </div>
                
                {currentAffirmation ? (
                  <blockquote className="text-xl md:text-2xl font-medium text-foreground leading-relaxed mb-6">
                    "{currentAffirmation}"
                  </blockquote>
                ) : (
                  <div className="py-8">
                    <div className="animate-pulse text-muted-foreground">
                      Loading your personalized affirmation...
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={loadNewAffirmation}
                    disabled={isLoading}
                    variant="outline"
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    New Affirmation
                  </Button>
                  <Button 
                    onClick={saveAffirmation}
                    className="gap-2"
                    disabled={!currentAffirmation}
                  >
                    <Heart className="w-4 h-4" />
                    Save to Favorites
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Personalization */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Personalize Your Affirmations</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Tell us what you're working on or struggling with for more relevant affirmations.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={userContext}
                    onChange={(e) => setUserContext(e.target.value)}
                    placeholder="e.g., 'dealing with exam anxiety' or 'building self-confidence'"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handlePersonalize}
                    disabled={!userContext.trim() || isLoading}
                  >
                    Personalize
                  </Button>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {contextSuggestions.map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => setUserContext(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Streak Counter */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="w-5 h-5 text-saffron" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {streak}
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Affirmations saved
                </div>
                <div className="text-xs text-muted-foreground">
                  Keep building positive habits! ✨
                </div>
              </CardContent>
            </Card>

            {/* Saved Affirmations */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Your Favorites</CardTitle>
              </CardHeader>
              <CardContent>
                {state.affirmations.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    Save affirmations that resonate with you to see them here.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {state.affirmations.slice(-5).reverse().map((affirmation, index) => (
                      <div 
                        key={index}
                        className="p-3 rounded-lg bg-muted/30 text-sm leading-relaxed"
                      >
                        "{affirmation}"
                      </div>
                    ))}
                    {state.affirmations.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        And {state.affirmations.length - 5} more saved affirmations
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="shadow-soft border-healing/20 bg-healing-soft/20">
              <CardHeader>
                <CardTitle className="text-lg text-healing">Daily Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Read your affirmation out loud for greater impact</p>
                <p>• Set a daily reminder to visit this page</p>
                <p>• Write down affirmations that particularly resonate</p>
                <p>• Share positive affirmations with friends</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAffirmations;