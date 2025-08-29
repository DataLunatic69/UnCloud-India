import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, ArrowLeft, Plus, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Mood } from '@/contexts/AppContext';

const MOOD_EMOJIS = ['😢', '😔', '😐', '🙂', '😊', '😄', '🤗', '😍', '🤩', '🌟'];
const MOOD_LABELS = ['Very Low', 'Low', 'Below Average', 'Okay', 'Good', 'Happy', 'Great', 'Excellent', 'Amazing', 'Fantastic'];

const MOOD_TAGS = [
  'anxious', 'stressed', 'overwhelmed', 'peaceful', 'confident', 'grateful',
  'family pressure', 'exam stress', 'social anxiety', 'achievement', 'progress',
  'lonely', 'supported', 'hopeful', 'tired', 'energetic', 'focused', 'distracted'
];

const MoodTracking = () => {
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { state, dispatch } = useApp();

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSaveMood = () => {
    const mood: Mood = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      rating: selectedRating,
      notes: notes.trim() || undefined,
      tags: selectedTags,
    };

    dispatch({ type: 'ADD_MOOD', payload: mood });
    
    // Reset form
    setSelectedRating(5);
    setNotes('');
    setSelectedTags([]);
  };

  const recentMoods = state.moods
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  const averageMood = state.moods.length > 0 
    ? state.moods.reduce((sum, mood) => sum + mood.rating, 0) / state.moods.length
    : 0;

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
              <div className="w-10 h-10 bg-healing-soft rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-healing" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Mood Tracking</h1>
                <p className="text-sm text-muted-foreground">Track your emotional wellness journey</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Mood Entry */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                How are you feeling today?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mood Rating */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Rate your overall mood (1-10)
                </label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {MOOD_EMOJIS.map((emoji, index) => {
                    const rating = index + 1;
                    return (
                      <button
                        key={rating}
                        onClick={() => setSelectedRating(rating)}
                        className={`p-3 text-2xl rounded-lg border-2 transition-all hover:scale-105 ${
                          selectedRating === rating
                            ? 'border-primary bg-primary-soft'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {MOOD_LABELS[selectedRating - 1]}
                </p>
              </div>

              {/* Mood Tags */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  What's influencing your mood? (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {MOOD_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Additional notes (optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What happened today? Any insights or thoughts you'd like to remember?"
                  className="min-h-[100px]"
                />
              </div>

              <Button onClick={handleSaveMood} className="w-full">
                <Heart className="w-4 h-4 mr-2" />
                Save Today's Mood
              </Button>
            </CardContent>
          </Card>

          {/* Mood History & Insights */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-calm" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {state.moods.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Days Tracked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-healing">
                      {averageMood > 0 ? averageMood.toFixed(1) : '—'}
                    </div>
                    <div className="text-sm text-muted-foreground">Average Mood</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Moods */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-saffron" />
                  Recent Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentMoods.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Start tracking your moods to see patterns and insights here.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentMoods.map((mood) => (
                      <div key={mood.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="text-2xl">{MOOD_EMOJIS[mood.rating - 1]}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {new Date(mood.date).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {MOOD_LABELS[mood.rating - 1]}
                            </span>
                          </div>
                          {mood.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {mood.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {mood.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{mood.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                          {mood.notes && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {mood.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracking;