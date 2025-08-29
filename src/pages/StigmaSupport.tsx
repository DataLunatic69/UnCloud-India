import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Heart, Users, HelpCircle, Phone, Sparkles, Send, Mic, MicOff, Shield, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAI } from '@/hooks/useAI';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { toast } from 'sonner';

const StigmaSupport = () => {
  const navigate = useNavigate();
  const { getStigmaSupport, isLoading, speechToText } = useAI();
  const { 
    isRecording, 
    error: recordingError, 
    startRecording, 
    stopRecording, 
    cancelRecording 
  } = useAudioRecording();

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [userSituation, setUserSituation] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isGettingSupport, setIsGettingSupport] = useState(false);
  const [transcript, setTranscript] = useState('');

  const handleGetSupport = async () => {
    if (!userSituation.trim()) {
      toast.error('Please describe your situation first');
      return;
    }

    setIsGettingSupport(true);
    try {
      const response = await getStigmaSupport(userSituation);
      setAiResponse(response);
      toast.success('AI support generated');
    } catch (error) {
      toast.error('Failed to get AI support');
    } finally {
      setIsGettingSupport(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      try {
        const audioBlob = await stopRecording();
        
        // Try OpenAI Whisper for speech-to-text conversion
        try {
          const transcriptResult = await speechToText(audioBlob);
          setTranscript(transcriptResult);
          setUserSituation(transcriptResult);
          toast.success('Voice input transcribed successfully!');
        } catch (whisperError) {
          console.warn('Whisper API failed:', whisperError);
          toast.error('Failed to transcribe audio. Please try typing instead.');
        }
      } catch (error) {
        console.error('Error processing voice input:', error);
        toast.error('Failed to process voice input. Please try again.');
      }
    } else {
      // Start recording
      try {
        await startRecording();
        toast.info('Recording started. Click the mic again to stop.');
      } catch (error) {
        console.error('Error starting recording:', error);
        toast.error('Failed to start recording. Please check microphone permissions.');
      }
    }
  };

  useEffect(() => {
    if (transcript && transcript.trim()) {
      setUserSituation(transcript);
    }
  }, [transcript]);

  // Handle recording errors
  useEffect(() => {
    if (recordingError) {
      toast.error(recordingError);
    }
  }, [recordingError]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-healing-soft rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-healing" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Stigma Support</h1>
                  <p className="text-sm text-muted-foreground">Breaking barriers, building understanding</p>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Enhanced
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* AI Support Section */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Stigma Support
            </CardTitle>
            <CardDescription>
              Get personalized support and advice for your specific situation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Describe your situation (optional but recommended for personalized support)
              </label>
              <Textarea
                placeholder={isRecording ? "Recording... Click mic to stop" : "Share what you're experiencing with stigma around mental health... (e.g., 'My family doesn't understand when I talk about feeling anxious')"}
                value={userSituation}
                onChange={(e) => setUserSituation(e.target.value)}
                disabled={isRecording}
                rows={4}
              />
              <div className="flex gap-2 mt-2">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={handleVoiceInput}
                  disabled={isLoading}
                  title={isRecording ? "Stop recording" : "Start voice recording"}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isRecording ? 'Stop Recording' : 'Voice Input'}
                </Button>
                <Button 
                  onClick={handleGetSupport}
                  disabled={isGettingSupport || isLoading}
                  size="sm"
                >
                  {isGettingSupport ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Getting Support...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Get AI Support
                    </>
                  )}
                </Button>
              </div>
            </div>

            {aiResponse && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Support & Guidance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                    {aiResponse}
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            You're Not Alone in This Journey
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Mental health stigma is real, but so is our collective power to overcome it. 
            Here's how we can face it together.
          </p>
        </div>

        {/* Support Strategies */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Self-Compassion First
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Remember: seeking help for mental health is as normal as visiting a doctor for a physical ailment.
              </p>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Your feelings are valid and deserve attention</li>
                <li>• Mental health challenges are medical conditions, not character flaws</li>
                <li>• You have the right to prioritize your wellbeing</li>
                <li>• Recovery is possible with the right support</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-healing" />
                Handling Family & Social Pressure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Navigate conversations with family and friends who may not understand mental health.
              </p>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Start with trusted family members or friends</li>
                <li>• Share educational resources about mental health</li>
                <li>• Set boundaries about what you will and won't discuss</li>
                <li>• Find allies who can support you in family discussions</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-saffron" />
                Common Myths vs. Reality
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Myth: "Just think positive"</p>
                  <p className="text-sm text-muted-foreground">Reality: Mental health conditions require proper support and sometimes treatment.</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Myth: "It's just a phase"</p>
                  <p className="text-sm text-muted-foreground">Reality: Mental health challenges are real and deserve proper attention.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Building Your Support Network
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Create a circle of understanding and support around you.
              </p>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Connect with others who understand mental health</li>
                <li>• Join online or local support groups</li>
                <li>• Educate willing family members and friends</li>
                <li>• Consider professional counseling or therapy</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Crisis Support */}
        <Card className="shadow-soft border-red-200 bg-red-50/50 mb-8">
          <CardHeader>
            <CardTitle className="text-red-700">Crisis Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">
              If you're experiencing thoughts of self-harm or feeling unsafe, please reach out immediately:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Emergency:</strong> 102 (India Emergency)</p>
              <p><strong>Mental Health Helpline:</strong> 9152987821</p>
              <p><strong>Vandrevala Foundation:</strong> 9999666555</p>
              <p><strong>AASRA:</strong> 9820466726</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="text-center space-y-4">
          <div className="flex gap-4 justify-center">
            <Button 
              variant="outline"
              onClick={() => handleNavigate('/myth-buster')}
            >
              Debunk More Myths
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleNavigate('/local-resources')}
            >
              Find Local Support
            </Button>
            <Button onClick={() => handleNavigate('/ai-therapist')}>
              Talk to AI Therapist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StigmaSupport;