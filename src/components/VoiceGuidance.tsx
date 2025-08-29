import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAI } from '@/hooks/useAI';

interface VoiceGuidanceProps {
  script: string;
  title: string;
  duration?: string;
  isActive?: boolean;
  onComplete?: () => void;
  className?: string;
}

export const VoiceGuidance: React.FC<VoiceGuidanceProps> = ({
  script,
  title,
  duration,
  isActive = false,
  onComplete,
  className = ""
}) => {
  const { textToSpeech } = useAI();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [progress, setProgress] = useState(0);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1.1, // Faster rate for younger sound
    pitch: 1.1, // Slightly higher pitch for younger voice
    volume: 0.9,
    voice: 'nova' // OpenAI's softest female voice
  });
  const [segments, setSegments] = useState<string[]>([]);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const segmentTimeouts = useRef<NodeJS.Timeout[]>([]);

  // Break script into segments for better pacing
  useEffect(() => {
    const scriptSegments = script
      .split(/\.\.\.|\.(?=\s+[A-Z])|\.(?=\s*$)/)
      .map(segment => segment.trim())
      .filter(segment => segment.length > 0)
      .map(segment => segment.endsWith('.') ? segment : segment + '.');
    
    setSegments(scriptSegments);
  }, [script]);

  // Clean up timeouts and intervals
  useEffect(() => {
    return () => {
      stopGuidance();
      clearAllTimeouts();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const clearAllTimeouts = () => {
    segmentTimeouts.current.forEach(timeout => clearTimeout(timeout));
    segmentTimeouts.current = [];
  };

  const startGuidance = async () => {
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentSegment(0);
    setCurrentPosition(0);
    setProgress(0);

    // Use OpenAI TTS if available, fallback to browser TTS
    try {
      await playWithOpenAI();
    } catch (error) {
      console.warn('OpenAI TTS not available, using browser TTS');
      playWithBrowserTTS();
    }
  };

  const playWithOpenAI = async () => {
    try {
      // Play each segment with pauses
      for (let i = 0; i < segments.length; i++) {
        if (!isPlaying) break;
        
        setCurrentSegment(i);
        await textToSpeech(segments[i]);
        
        // Add natural pause between segments
        if (i < segments.length - 1) {
          await new Promise(resolve => {
            const timeout = setTimeout(resolve, 1500);
            segmentTimeouts.current.push(timeout);
          });
        }
        
        setProgress(((i + 1) / segments.length) * 100);
      }
      
      if (isPlaying) {
        completeGuidance();
      }
    } catch (error) {
      console.error('OpenAI TTS error:', error);
      throw error;
    }
  };

  const playWithBrowserTTS = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel(); // Cancel any existing speech
      
      let segmentIndex = 0;
      
      const playNextSegment = () => {
        if (segmentIndex >= segments.length || !isPlaying) {
          completeGuidance();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(segments[segmentIndex]);
        utteranceRef.current = utterance;
        
        // Configure voice settings
        utterance.rate = voiceSettings.rate;
        utterance.pitch = voiceSettings.pitch;
        utterance.volume = isMuted ? 0 : voiceSettings.volume;
        
        // Try to use a young, soft female voice
        const voices = speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice => 
          // Prioritize younger-sounding voices
          voice.name.toLowerCase().includes('jenny') ||
          voice.name.toLowerCase().includes('aria') ||
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('girl') ||
          // Then soft female voices, excluding Microsoft ones (tend to be deeper)
          (voice.name.toLowerCase().includes('female') && !voice.name.toLowerCase().includes('microsoft')) ||
          voice.name.toLowerCase().includes('zira') ||
          voice.name.toLowerCase().includes('eva')
        ) || voices.find(voice => 
          // Fallback but exclude deeper/mature voices
          voice.lang.startsWith('en') && 
          !voice.name.toLowerCase().includes('adult') &&
          !voice.name.toLowerCase().includes('mature') &&
          !voice.name.toLowerCase().includes('deep') &&
          !voice.name.toLowerCase().includes('male')
        );
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }

        utterance.onstart = () => {
          setCurrentSegment(segmentIndex);
          startProgressTracking();
        };

        utterance.onend = () => {
          stopProgressTracking();
          segmentIndex++;
          setProgress((segmentIndex / segments.length) * 100);
          
          // Add pause between segments
          const timeout = setTimeout(() => {
            playNextSegment();
          }, 1500);
          segmentTimeouts.current.push(timeout);
        };

        utterance.onerror = (error) => {
          console.error('Speech synthesis error:', error);
          stopGuidance();
        };

        speechSynthesis.speak(utterance);
      };

      playNextSegment();
    }
  };

  const pauseGuidance = () => {
    setIsPaused(true);
    setIsPlaying(false);
    
    if (utteranceRef.current) {
      speechSynthesis.pause();
    }
    
    clearAllTimeouts();
    stopProgressTracking();
  };

  const resumeGuidance = () => {
    setIsPaused(false);
    setIsPlaying(true);
    
    if (utteranceRef.current) {
      speechSynthesis.resume();
      startProgressTracking();
    }
  };

  const stopGuidance = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSegment(0);
    setProgress(0);
    setCurrentPosition(0);
    
    speechSynthesis.cancel();
    clearAllTimeouts();
    stopProgressTracking();
  };

  const restartGuidance = () => {
    stopGuidance();
    setTimeout(startGuidance, 500);
  };

  const completeGuidance = () => {
    setIsPlaying(false);
    setProgress(100);
    onComplete?.();
    stopProgressTracking();
  };

  const startProgressTracking = () => {
    stopProgressTracking();
    progressIntervalRef.current = setInterval(() => {
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        // Estimate progress within current segment
        const segmentProgress = (currentSegment / segments.length) * 100;
        const withinSegmentProgress = (1 / segments.length) * 100;
        setProgress(Math.min(segmentProgress + (withinSegmentProgress * 0.5), 100));
      }
    }, 500);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const formatScript = (script: string) => {
    const formattedHtml = script
      // Handle bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      // Handle italic text  
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Convert sections with parentheses to styled time indicators
      .replace(/\(([0-9-]+\s*minutes?)\)/g, '<span class="text-xs px-2 py-1 bg-primary/10 rounded text-primary font-medium">$1</span>')
      .split('\n')
      .map(line => {
        const trimmedLine = line.trim();
        // Section headers with emojis
        if (trimmedLine.match(/^[🧘‍♀️🌸💫⭐🌙🧠💝🎯📚🏠👨‍👩‍👧‍👦💤😴🌊🔥❤️💪🎯📝]+\s*\*\*.*\*\*/) || 
            trimmedLine.match(/^\*\*[A-Z\s&()-]+\*\*$/)) {
          const headerText = trimmedLine.replace(/[🧘‍♀️🌸💫⭐🌙🧠💝🎯📚🏠👨‍👩‍👧‍👦💤😴🌊🔥❤️💪🎯📝🧘‍♂️]/g, '').replace(/\*\*/g, '').trim();
          return `<h3 class="text-lg font-semibold text-primary mt-4 mb-2 flex items-center gap-2">
            <span class="text-primary/70">${trimmedLine.match(/[🧘‍♀️🌸💫⭐🌙🧠💝🎯📚🏠👨‍👩‍👧‍👦💤😴🌊🔥❤️💪🎯📝🧘‍♂️]/)?.[0] || ''}</span>
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
    
    return <div dangerouslySetInnerHTML={{ __html: formattedHtml }} />;
  };

  const getCurrentSegmentText = () => {
    if (segments.length === 0) return script;
    return segments[currentSegment] || segments[0];
  };

  return (
    <Card className={`${className} ${isActive ? 'ring-2 ring-primary/50' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Voice Guidance</h3>
              <p className="text-sm text-muted-foreground">{title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {duration && (
              <Badge variant="outline" className="text-xs">
                {duration}
              </Badge>
            )}
            <Badge 
              variant={isPlaying ? 'default' : 'secondary'}
              className="text-xs"
            >
              {isPlaying ? 'Playing' : isPaused ? 'Paused' : 'Ready'}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Segment {currentSegment + 1} of {segments.length}
            </span>
            <span className="text-muted-foreground">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isPlaying && !isPaused ? (
              <Button onClick={startGuidance} className="gap-2">
                <Play className="w-4 h-4" />
                Start Guidance
              </Button>
            ) : isPaused ? (
              <Button onClick={resumeGuidance} variant="default" className="gap-2">
                <Play className="w-4 h-4" />
                Resume
              </Button>
            ) : (
              <Button onClick={pauseGuidance} variant="secondary" className="gap-2">
                <Pause className="w-4 h-4" />
                Pause
              </Button>
            )}
            
            <Button onClick={restartGuidance} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4" />
            </Button>

            <Button 
              onClick={() => setIsMuted(!isMuted)} 
              variant="outline" 
              size="sm"
              className={isMuted ? 'text-muted-foreground' : ''}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Voice Settings */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <label className="text-xs font-medium mb-1 block">Speed</label>
            <Slider
              value={[voiceSettings.rate * 10]}
              onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, rate: value / 10 }))}
              max={15}
              min={5}
              step={1}
              className="w-full"
            />
            <span className="text-xs text-muted-foreground">{voiceSettings.rate}x</span>
          </div>
          
          <div>
            <label className="text-xs font-medium mb-1 block">Volume</label>
            <Slider
              value={[voiceSettings.volume * 10]}
              onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, volume: value / 10 }))}
              max={10}
              min={1}
              step={1}
              className="w-full"
              disabled={isMuted}
            />
            <span className="text-xs text-muted-foreground">{Math.round(voiceSettings.volume * 100)}%</span>
          </div>
        </div>

        {/* Current Segment Display */}
        {isPlaying && (
          <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
            <p className="text-sm text-muted-foreground mb-2">Currently Speaking:</p>
            <p className="text-sm leading-relaxed text-foreground">
              {getCurrentSegmentText()}
            </p>
          </div>
        )}

        {/* Full Script */}
        <div className="max-h-64 overflow-y-auto border rounded-lg p-4 bg-background">
          <div className="prose prose-sm max-w-none">
            <h4 className="text-sm font-medium mb-3">Full Meditation Script:</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              {formatScript(script)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};