import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, ArrowLeft, Shield, Brain, TrendingUp, User, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAI } from '@/hooks/useAI';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const AITherapist = () => {
  const [message, setMessage] = useState('');
  const [sessionId] = useState(() => Date.now().toString());
  const [userProfile, setUserProfile] = useState({
    age: '',
    gender: '',
    culturalBackground: 'Indian',
    primaryConcerns: [] as string[],
    familySituation: '',
    academicPressure: false,
    socialAnxiety: false
  });
  const [showProfile, setShowProfile] = useState(false);
  const [insights, setInsights] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    getTherapistResponse, 
    getTherapyInsights, 
    isLoading, 
    therapySessions,
    textToSpeech,
    speechToText
  } = useAI();
  const { 
    isRecording, 
    error: recordingError, 
    startRecording, 
    stopRecording, 
    cancelRecording 
  } = useAudioRecording();
  const { state, dispatch } = useApp();

  const messages = state.chatSessions[sessionId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get insights after 5+ messages
  useEffect(() => {
    if (messages.length >= 10 && !insights) {
      getTherapyInsights(sessionId).then(setInsights);
    }
  }, [messages.length, insights, sessionId, getTherapyInsights]);  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: message.trim(),
      timestamp: new Date().toISOString(),
      sessionId,
    };

    dispatch({ type: 'ADD_MESSAGE', payload: { sessionId, message: userMessage } });
    setMessage('');

    try {
      // Get AI response with enhanced context
      const response = await getTherapistResponse(message.trim(), sessionId, {
        userProfile,
        previousMessages: messages.map(m => m.content)
      });
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: response,
        timestamp: new Date().toISOString(),
        sessionId,
      };

      dispatch({ type: 'ADD_MESSAGE', payload: { sessionId, message: assistantMessage } });

      // Auto-play voice response if voice is enabled
      if (voiceEnabled && response) {
        handlePlayMessage(response);
      }
    } catch (error) {
      console.error('Error getting therapist response:', error);
      
      // Add fallback error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: "I'm sorry, I'm having trouble responding right now. Please try again, and know that I'm here to support you through whatever you're facing.",
        timestamp: new Date().toISOString(),
        sessionId,
      };

      dispatch({ type: 'ADD_MESSAGE', payload: { sessionId, message: errorMessage } });
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      try {
        const audioBlob = await stopRecording();
        
        // Try OpenAI Whisper first, fallback to browser speech recognition
        try {
          const transcript = await speechToText(audioBlob);
          setMessage(transcript);
          toast.success('Voice input transcribed successfully!');
        } catch (whisperError) {
          console.warn('Whisper API failed, trying browser speech recognition:', whisperError);
          // Fallback to browser speech recognition for next recording
          toast.warning('Using browser speech recognition as fallback');
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

  const handlePlayMessage = async (text: string) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      await textToSpeech(text);
    } catch (error) {
      console.error('Error playing message:', error);
      toast.error('Failed to play voice message.');
    } finally {
      setIsPlaying(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    
    // Press Ctrl/Cmd + M for voice input
    if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
      e.preventDefault();
      if (!isRecording && !isLoading) {
        handleVoiceInput();
      }
    }
  };

  const updateUserProfile = (field: string, value: any) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  const addPrimaryConcern = (concern: string) => {
    if (concern && !userProfile.primaryConcerns.includes(concern)) {
      updateUserProfile('primaryConcerns', [...userProfile.primaryConcerns, concern]);
    }
  };

  const removePrimaryConcern = (concern: string) => {
    updateUserProfile('primaryConcerns', userProfile.primaryConcerns.filter(c => c !== concern));
  };
  // Handle recording errors
  useEffect(() => {
    if (recordingError) {
      toast.error(recordingError);
    }
  }, [recordingError]);

  // Test microphone permissions
  const testMicrophonePermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      toast.success('Microphone access granted!');
      return true;
    } catch (error) {
      console.error('Microphone permission test failed:', error);
      toast.error('Microphone access denied. Please enable microphone permissions in your browser.');
      return false;
    }
  };

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
              <div className="w-10 h-10 bg-primary-soft rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">AI Therapist</h1>
                <p className="text-sm text-muted-foreground">Dr. Priya - Your compassionate mental health companion</p>
              </div>
            </div>            <Button
              variant="outline"
              size="sm"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="mr-2"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
              {voiceEnabled ? 'Voice On' : 'Voice Off'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProfile(!showProfile)}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Privacy Notice */}
            <Card className="border-healing/20 bg-healing-soft/30">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-healing" />
                  <CardTitle className="text-lg text-healing">Your Privacy & Safety</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>This is a supportive AI companion, not a replacement for professional therapy. 
                If you're experiencing thoughts of self-harm or crisis, please contact emergency services 
                or a mental health helpline immediately.</p>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card className="shadow-soft">
              <CardContent className="p-0">
                {/* Messages Area */}
                <div className="h-[500px] overflow-y-auto p-6 space-y-4">                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Welcome to your safe space
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Hi, I'm Dr. Priya. I'm here to listen with empathy and provide 
                        culturally-aware support for your mental wellness journey. What's on your mind today?
                      </p>                      <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                        <h4 className="text-sm font-medium text-foreground mb-2">Voice Features:</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>🎤 Click the mic button or press Ctrl+M to record your voice</li>
                          <li>🔊 Voice replies will play automatically (toggle with voice button in header)</li>
                        </ul>
                      </div>
                    </div>
                  )}{messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <span className="text-xs opacity-70 mt-2 block">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          {msg.role === 'assistant' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePlayMessage(msg.content)}
                              disabled={isPlaying}
                              className="h-6 w-6 p-0"
                            >
                              <Volume2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>                {/* Input Area */}
                <div className="border-t p-4">
                  <div className="flex gap-3">
                    <Button
                      variant={isRecording ? "destructive" : "outline"}
                      size="sm"
                      onClick={handleVoiceInput}
                      disabled={isLoading}
                      className="px-3"
                      title={isRecording ? "Stop recording (Ctrl+M)" : "Start voice recording (Ctrl+M)"}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={isRecording ? "Recording... Click mic to stop" : "Share what's on your mind..."}
                      disabled={isLoading}
                      className="flex-1 min-h-[2.5rem] max-h-32 resize-none"
                      rows={1}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isLoading}
                      className="px-6"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-muted-foreground">
                      Press Enter to send, Shift+Enter for new line, Ctrl+M for voice input
                    </p>
                    {recordingError && (
                      <p className="text-xs text-red-500">{recordingError}</p>
                    )}
                    {isRecording && (
                      <p className="text-xs text-primary animate-pulse">Recording in progress...</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile */}
            {showProfile && (
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg">Your Profile</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Help me understand you better for more personalized support
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium">Age</label>
                      <Input
                        value={userProfile.age}
                        onChange={(e) => updateUserProfile('age', e.target.value)}
                        placeholder="Age"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Gender</label>
                      <Input
                        value={userProfile.gender}
                        onChange={(e) => updateUserProfile('gender', e.target.value)}
                        placeholder="Gender"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Family Situation</label>
                    <Input
                      value={userProfile.familySituation}
                      onChange={(e) => updateUserProfile('familySituation', e.target.value)}
                      placeholder="e.g., Nuclear family, joint family"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Primary Concerns</label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        placeholder="Add concern"
                        onKeyPress={(e) => e.key === 'Enter' && addPrimaryConcern(e.currentTarget.value)}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {userProfile.primaryConcerns.map((concern, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removePrimaryConcern(concern)}
                        >
                          {concern} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Common Challenges</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="academicPressure"
                        checked={userProfile.academicPressure}
                        onChange={(e) => updateUserProfile('academicPressure', e.target.checked)}
                      />
                      <label htmlFor="academicPressure" className="text-sm">Academic Pressure</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="socialAnxiety"
                        checked={userProfile.socialAnxiety}
                        onChange={(e) => updateUserProfile('socialAnxiety', e.target.checked)}
                      />
                      <label htmlFor="socialAnxiety" className="text-sm">Social Anxiety</label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Therapy Insights */}
            {insights && (
              <Card className="shadow-soft border-primary/20 bg-primary-soft/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    Session Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insights}
                  </p>
                </CardContent>
              </Card>
            )}            {/* Quick Actions */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Track Progress
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Brain className="w-4 h-4 mr-2" />
                  Get Insights
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Crisis Support
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start" 
                  onClick={testMicrophonePermissions}
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Test Microphone
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITherapist;