import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Download, Mic, MicOff, Volume2, VolumeX, Settings, Sparkles, Headphones, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { VoicePlayer } from '@/components/VoicePlayer';
import { useAI } from '@/hooks/useAI';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { voiceManager } from '@/lib/voiceManager';
import { toast } from 'sonner';

const AIMeditations = () => {
  const { 
    isLoading, 
    getAllMeditations, 
    getMeditationScript, 
    generateMeditationScript,
    generateMeditationForAvailable,
    textToSpeech,
    speechToText,
    categories 
  } = useAI();
  
  const { 
    isRecording, 
    error: recordingError, 
    startRecording, 
    stopRecording, 
    cancelRecording 
  } = useAudioRecording();
  
  const [selectedMeditation, setSelectedMeditation] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('stress-relief');
  const [duration, setDuration] = useState([5]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedScript, setGeneratedScript] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [enhancedMeditations, setEnhancedMeditations] = useState<{[key: string]: any}>({});
  const [isEnhancing, setIsEnhancing] = useState<{[key: string]: boolean}>({});
  const [transcript, setTranscript] = useState('');

  const meditations = getAllMeditations();

  useEffect(() => {
    if (transcript && transcript.trim()) {
      setCustomPrompt(transcript);
    }
  }, [transcript]);

  // Handle recording errors
  useEffect(() => {
    if (recordingError) {
      toast.error(recordingError);
    }
  }, [recordingError]);

  // Cleanup effect to stop any ongoing voice when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      // Stop any ongoing speech using voice manager
      voiceManager.stopVoice();
      setIsPlaying(false);
    };
  }, []);

  const handlePlayPause = async (meditation: any) => {
    if (selectedMeditation?.title === meditation.title && isPlaying) {
      // Stop current playback using voice manager
      setIsPlaying(false);
      voiceManager.stopVoice();
    } else {
      setSelectedMeditation(meditation);
      setIsPlaying(true);
      
      // If voice is enabled, the VoicePlayer component will handle TTS
      if (!voiceEnabled) {
        // Just show the script without voice
        setIsPlaying(false);
      }
    }
  };

  const enhanceMeditation = async (meditation: any, index: number) => {
    const meditationKey = `${meditation.title}-${index}`;
    setIsEnhancing(prev => ({ ...prev, [meditationKey]: true }));
    
    try {
      const enhancedScript = await generateMeditationForAvailable(meditation);
      setEnhancedMeditations(prev => ({ 
        ...prev, 
        [meditationKey]: enhancedScript 
      }));
      toast.success(`Enhanced "${meditation.title}" with AI!`);
    } catch (error) {
      toast.error('Failed to enhance meditation');
    } finally {
      setIsEnhancing(prev => ({ ...prev, [meditationKey]: false }));
    }
  };

  const formatScriptPreview = (script: string, maxLength: number = 150) => {
    // Clean the script for preview
    const cleaned = script
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting for preview
      .replace(/[🧘‍♀️🌸💫⭐🌙🧠💝🎯📚🏠👨‍👩‍👧‍👦💤😴🌊🔥❤️💪🎯📝🧘‍♂️]/g, '') // Remove emojis including family emoji
      .replace(/\([0-9-]+\s*minutes?\)/g, '') // Remove timing indicators
      .replace(/\n+/g, ' ') // Replace line breaks with spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
    
    return cleaned.length > maxLength ? 
      `${cleaned.substring(0, maxLength)}...` : 
      cleaned;
  };

  const getCurrentMeditation = (meditation: any, index: number) => {
    const meditationKey = `${meditation.title}-${index}`;
    return enhancedMeditations[meditationKey] || meditation;
  };

  const formatMeditationScript = (script: string) => {
    return script
      // Handle bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      // Handle italic text
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Convert sections with parentheses to styled time indicators
      .replace(/\(([0-9-]+\s*minutes?)\)/g, '<span class="text-xs px-2 py-1 bg-primary/10 rounded text-primary font-medium">$1</span>')
      // Convert lines that are all caps or start with emojis to headers
      .split('\n')
      .map(line => {
        const trimmedLine = line.trim();
        // Section headers (all caps or emoji + title)
        if (trimmedLine.match(/^[🧘‍♀️🌸💫⭐🌙🧠💝🎯📚🏠👨‍👩‍👧‍👦💤😴🌊🔥❤️💪🎯📝]+\s*\*\*.*\*\*/) || 
            trimmedLine.match(/^\*\*[A-Z\s&()-]+\*\*$/)) {
          const headerText = trimmedLine.replace(/[💫⭐🌙]/g, '').replace(/\*\*/g, '').trim();
          return `<h3 class="text-lg font-semibold text-primary mt-4 mb-2 flex items-center gap-2">
            <span class="text-primary/70">${trimmedLine.match(/[💫⭐🌙]/)?.[0] || ''}</span>
            ${headerText}
          </h3>`;
        }
        // Sub-headers with timing
        if (trimmedLine.match(/^\*\*.*\([0-9-]+.*\)\*\*$/)) {
          return `<h4 class="text-base font-medium text-primary/80 mt-3 mb-1">${trimmedLine.replace(/\*\*/g, '')}</h4>`;
        }
        // Regular paragraphs
        if (trimmedLine.length > 0) {
          return `<p class="mb-2 leading-relaxed">${line}</p>`;
        }
        return '<div class="mb-2"></div>'; // Empty line spacing
      })
      .join('\n');
  };

  const generateCustomMeditation = async () => {
    setIsGenerating(true);
    try {
      const prompt = customPrompt || selectedCategory;
      const script = await generateMeditationScript(prompt, duration[0]);
      setGeneratedScript(script);
      setSelectedMeditation(script);
      toast.success('Custom meditation generated!');
    } catch (error) {
      toast.error('Failed to generate meditation');
    } finally {
      setIsGenerating(false);
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
          setCustomPrompt(transcriptResult);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-calm-soft rounded-lg flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-calm" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">AI Meditations</h1>
                  <p className="text-muted-foreground">Personalized guided meditations</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Voice:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={voiceEnabled ? 'border-primary' : ''}
                >
                  {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>
              <Badge variant="secondary">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* AI Meditation Generator */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Meditation Creator
                </CardTitle>
                <CardDescription>
                  Generate personalized meditations using AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Duration: {duration[0]} minutes
                  </label>
                  <Slider
                    value={duration}
                    onValueChange={setDuration}
                    max={20}
                    min={3}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Custom Request (Optional)
                  </label>
                  <Textarea
                    placeholder={isRecording ? "Recording... Click mic to stop" : "Describe what kind of meditation you need... (e.g., 'Help me with exam anxiety')"}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    disabled={isRecording}
                    rows={3}
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
                  </div>
                </div>

                <Button 
                  onClick={generateCustomMeditation}
                  disabled={isGenerating || isLoading}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Settings className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Meditation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {categories.slice(0, 6).map((category) => (
                    <Button
                      key={category}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCategory(category);
                        generateCustomMeditation();
                      }}
                      disabled={isGenerating}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Now Playing */}
            {selectedMeditation && (
              <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Now Playing</span>
                    <Badge variant={generatedScript ? "default" : "secondary"}>
                      {generatedScript ? "AI Generated" : "Template"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium">{selectedMeditation.title}</h3>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedMeditation.duration}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePlayPause(selectedMeditation)}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {selectedMeditation.tags && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {selectedMeditation.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Available Meditations */}
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Available Meditations</h2>
                <div className="text-right">
                  <p className="text-muted-foreground text-sm">Click ✨ to enhance with AI</p>
                  <p className="text-muted-foreground text-xs">Now with comprehensive scripts!</p>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {meditations.map((meditation, index) => {
                  const currentMeditation = getCurrentMeditation(meditation, index);
                  const meditationKey = `${meditation.title}-${index}`;
                  const isCurrentlyEnhancing = isEnhancing[meditationKey];
                  const isEnhanced = !!enhancedMeditations[meditationKey];
                  
                  return (
                    <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{currentMeditation.title}</h3>
                              {isEnhanced && (
                                <Badge variant="default" className="text-xs">
                                  <Sparkles className="w-2 h-2 mr-1" />
                                  AI Enhanced
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {currentMeditation.duration}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePlayPause(currentMeditation)}
                            >
                              {selectedMeditation?.title === currentMeditation.title && isPlaying ? 
                                <Pause className="h-4 w-4" /> : 
                                <Play className="h-4 w-4" />
                              }
                            </Button>
                            {!isEnhanced && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => enhanceMeditation(meditation, index)}
                                disabled={isCurrentlyEnhancing || isLoading}
                                className="ml-1"
                              >
                                {isCurrentlyEnhancing ? (
                                  <Settings className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Sparkles className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {formatScriptPreview(currentMeditation.script, 100)}
                        </p>
                        
                        {currentMeditation.tags && (
                          <div className="flex flex-wrap gap-1">
                            {currentMeditation.tags.map((tag: string, tagIndex: number) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Full Meditation Script */}
        {selectedMeditation && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Voice Player - Prominent placement */}
            <div className="lg:col-span-1">
              <VoicePlayer
                text={selectedMeditation.script}
                title={selectedMeditation.title}
                isEnabled={voiceEnabled}
                onToggleEnabled={() => setVoiceEnabled(!voiceEnabled)}
                autoPlay={false}
              />
            </div>
            
            {/* Script Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Meditation Script</span>
                    <div className="flex items-center gap-2">
                      {generatedScript && (
                        <Badge variant="default">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI Generated
                        </Badge>
                      )}
                      {selectedMeditation.tags?.includes('ai-enhanced') && (
                        <Badge variant="secondary">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI Enhanced
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {selectedMeditation.duration} • 
                    {generatedScript 
                      ? "AI-generated personalized meditation" 
                      : selectedMeditation.tags?.includes('ai-enhanced')
                      ? "AI-enhanced comprehensive meditation"
                      : "Comprehensive guided meditation"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div 
                      className="whitespace-pre-line text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatMeditationScript(selectedMeditation.script) }}
                    />
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 mt-6 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setVoiceEnabled(!voiceEnabled)}
                    >
                      {voiceEnabled ? (
                        <>
                          <Volume2 className="h-4 w-4 mr-2" />
                          Voice Enabled
                        </>
                      ) : (
                        <>
                          <VolumeX className="h-4 w-4 mr-2" />
                          Enable Voice
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <div className="flex-1" />
                    <div className="text-xs text-muted-foreground">
                      ✨ Enhanced with AI voice guidance
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIMeditations;