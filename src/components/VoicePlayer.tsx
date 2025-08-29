import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward, 
  RotateCcw,
  Settings,
  Headphones
} from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { voiceManager } from '@/lib/voiceManager';
import { toast } from 'sonner';

interface VoicePlayerProps {
  text: string;
  title: string;
  isEnabled: boolean;
  onToggleEnabled: () => void;
  autoPlay?: boolean;
}

interface MeditationSection {
  title: string;
  content: string;
  startTime: number; // For future use
  duration: string;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  text,
  title,
  isEnabled,
  onToggleEnabled,
  autoPlay = false
}) => {
  const { textToSpeech } = useAI();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChunk, setCurrentChunk] = useState({ index: 0, total: 0 });
  const [volume, setVolume] = useState([0.8]);
  const [speed, setSpeed] = useState([1]);
  const [showControls, setShowControls] = useState(false);
  const [sections, setSections] = useState<MeditationSection[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isSettingsChanged, setIsSettingsChanged] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pausedAtRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Cleanup effect to stop voice when component unmounts or props change
  useEffect(() => {
    return () => {
      // Cleanup on unmount using voice manager
      if (isPlaying) {
        voiceManager.stopVoice();
      }
    };
  }, [isPlaying]);

  // Stop playback when voice is disabled
  useEffect(() => {
    if (!isEnabled && isPlaying) {
      handleStop();
    }
  }, [isEnabled]);

  // Stop playback when text changes (meditation changes)
  useEffect(() => {
    if (isPlaying) {
      handleStop();
    }
  }, [text]);

  // Extract meditation sections from the text with enhanced parsing
  useEffect(() => {
    const extractSections = (text: string): MeditationSection[] => {
      const lines = text.split('\n').filter(line => line.trim());
      const sections: MeditationSection[] = [];
      let currentSection: MeditationSection | null = null;
      let estimatedTotalTime = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Enhanced section header detection
        const sectionMatch = line.match(
          /\*\*(.+?)\*\*|^([A-Z][A-Za-z\s&()-]+)(\s*\(\d+-?\d*\s*minutes?\))?/i
        );
        
        if (sectionMatch || (line.includes('**') && line.length < 80)) {
          // Save previous section
          if (currentSection) {
            // Estimate content length for time calculation
            const contentLength = currentSection.content.length;
            const estimatedDuration = Math.max(1, Math.ceil(contentLength / 200)); // ~200 chars per minute
            currentSection.startTime = estimatedTotalTime;
            estimatedTotalTime += estimatedDuration;
            sections.push(currentSection);
          }
          
          // Start new section
          const sectionTitle = (sectionMatch?.[1] || sectionMatch?.[2] || line.replace(/\*\*/g, '')).trim();
          const durationMatch = line.match(/\((\d+(?:-\d+)?)\s*minutes?\)/i);
          let duration = '1-2 minutes';
          
          if (durationMatch) {
            duration = durationMatch[1].includes('-') ? `${durationMatch[1]} minutes` : `${durationMatch[1]} minutes`;
          }
          
          currentSection = {
            title: sectionTitle,
            content: line,
            startTime: estimatedTotalTime,
            duration
          };
        } else if (currentSection && line.trim()) {
          currentSection.content += '\n' + line;
        }
      }
      
      // Add the last section
      if (currentSection) {
        const contentLength = currentSection.content.length;
        const estimatedDuration = Math.max(1, Math.ceil(contentLength / 200));
        currentSection.startTime = estimatedTotalTime;
        estimatedTotalTime += estimatedDuration;
        sections.push(currentSection);
      }
      
      // If no sections found, create a comprehensive single section
      if (sections.length === 0) {
        const contentLength = text.length;
        const estimatedDuration = Math.max(5, Math.ceil(contentLength / 150));
        
        sections.push({
          title: 'Complete Meditation',
          content: text,
          startTime: 0,
          duration: `${estimatedDuration} minutes`
        });
        estimatedTotalTime = estimatedDuration;
      }
      
      setTotalTime(estimatedTotalTime * 60); // Convert to seconds
      return sections;
    };
    
    setSections(extractSections(text));
    setCurrentSection(0);
    setProgress(0);
    setElapsedTime(0);
  }, [text]);

  useEffect(() => {
    if (autoPlay && isEnabled && text && !isPlaying) {
      handlePlay();
    }
  }, [autoPlay, isEnabled, text]);

  const handlePlay = async () => {
    if (isPaused) {
      // Resume from pause
      setIsPaused(false);
      setIsPlaying(true);
      startTimeRef.current = Date.now() - pausedAtRef.current;
      toast.info('Meditation resumed');
      return;
    }
    
    if (isPlaying) {
      // Pause current playback
      handlePause();
      return;
    }

    if (!isEnabled) {
      toast.error('Please enable voice guidance first');
      return;
    }

    setIsLoading(true);
    setIsPlaying(true);
    setIsPaused(false);
    setProgress(0);
    setCurrentSection(0);
    setElapsedTime(0);
    startTimeRef.current = Date.now();
    pausedAtRef.current = 0;
    
    // Create new abort controller and register with voice manager
    abortControllerRef.current = new AbortController();
    voiceManager.startVoice(abortControllerRef.current);

    try {
      await textToSpeech(text, {
        onProgress: (prog) => {
          setProgress(prog);
        },
        onChunkStart: (chunkIndex, totalChunks) => {
          setCurrentChunk({ index: chunkIndex, total: totalChunks });
          // Enhanced section mapping with time-based calculation
          if (sections.length > 1) {
            const progressRatio = chunkIndex / totalChunks;
            const estimatedTime = progressRatio * totalTime;
            
            // Find current section based on estimated time
            let newSection = 0;
            for (let i = 0; i < sections.length; i++) {
              if (estimatedTime >= sections[i].startTime * 60) {
                newSection = i;
              } else {
                break;
              }
            }
            setCurrentSection(Math.min(newSection, sections.length - 1));
          }
        },
        signal: abortControllerRef.current.signal,
        speed: speed[0],
        volume: volume[0]
      });
      
      setProgress(100);
      setCurrentSection(sections.length - 1);
      setIsPlaying(false);
      toast.success('Meditation guidance completed');
    } catch (error) {
      if (error.message !== 'Aborted' && error.message !== 'Paused') {
        console.error('Voice playback error:', error);
        toast.error('Voice playback failed');
      }
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handlePause = () => {
    if (!isPlaying) return;
    
    // Pause the playback
    voiceManager.stopVoice();
    setIsPlaying(false);
    setIsPaused(true);
    pausedAtRef.current = Date.now() - startTimeRef.current;
    toast.info('Meditation paused');
  };

  const handleStop = () => {
    // Use voice manager to stop globally
    voiceManager.stopVoice();
    
    // Reset all states
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
    setProgress(0);
    setCurrentSection(0);
    setCurrentChunk({ index: 0, total: 0 });
    setElapsedTime(0);
    pausedAtRef.current = 0;
    startTimeRef.current = 0;
    abortControllerRef.current = null;
    
    toast.info('Meditation stopped');
  };

  const jumpToSection = (sectionIndex: number) => {
    if (sectionIndex >= 0 && sectionIndex < sections.length) {
      handleStop();
      setCurrentSection(sectionIndex);
      toast.info(`Jumped to: ${sections[sectionIndex].title}`);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRestart = () => {
    handleStop();
    setTimeout(() => handlePlay(), 100);
  };

  const skipToSection = (direction: 'forward' | 'backward') => {
    // For now, just restart or stop since we don't have section-level control
    // This could be enhanced to work with specific sections
    if (direction === 'backward') {
      handleRestart();
    } else {
      // Skip forward - for future implementation
      toast.info('Skip forward feature coming soon!');
    }
  };

  if (!isEnabled) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <VolumeX className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Voice Guidance Available</h3>
              <p className="text-sm text-muted-foreground">
                Enable voice guidance to hear this meditation script
              </p>
            </div>
            <Button onClick={onToggleEnabled} className="w-full">
              <Headphones className="h-4 w-4 mr-2" />
              Enable Voice Guidance
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            Voice Guidance
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">
              {isPlaying ? 'Playing' : isLoading ? 'Loading' : 'Ready'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowControls(!showControls)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRestart()}
            disabled={isLoading}
            title="Restart Meditation"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={handlePlay}
            disabled={isLoading}
            size="lg"
            className="px-8"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPaused ? (
              <Play className="h-5 w-5 ml-1" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-1" />
            )}
            <span className="ml-2">
              {isLoading ? 'Loading...' : 
               isPaused ? 'Resume' : 
               isPlaying ? 'Pause' : 
               'Play Meditation'}
            </span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleStop}
            disabled={isLoading || (!isPlaying && !isPaused)}
            title="Stop Meditation"
          >
            <div className="h-4 w-4 bg-current rounded-sm" />
          </Button>
        </div>

        {/* Enhanced Progress Indicator */}
        {(isPlaying || isPaused || progress > 0) && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {formatTime(elapsedTime)} / {formatTime(totalTime)}
                </span>
                {currentChunk.total > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Chunk {currentChunk.index + 1}/{currentChunk.total}
                  </Badge>
                )}
              </div>
              <span className="text-muted-foreground font-medium">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                {(isPlaying || isPaused) && (
                  <div className="absolute right-0 top-0 h-full w-1 bg-primary-foreground/30 animate-pulse" />
                )}
              </div>
            </div>
            {isPaused && (
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  ⏸️ Paused - Click Play to Resume
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Meditation Sections */}
        {sections.length > 1 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">Meditation Sections</h4>
              <Badge variant="outline" className="text-xs">
                {sections.length} sections
              </Badge>
            </div>
            <div className="grid gap-2 max-h-32 overflow-y-auto">
              {sections.map((section, index) => {
                const isActive = currentSection === index;
                const isCompleted = progress > 0 && index < currentSection;
                
                return (
                  <div 
                    key={index} 
                    className={`text-xs p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${
                      isActive ? 'bg-primary/10 border-primary/30 shadow-sm' : 
                      isCompleted ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                      'bg-muted/30 border-muted hover:bg-muted/50'
                    }`}
                    onClick={() => jumpToSection(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            isActive ? 'text-primary' : 
                            isCompleted ? 'text-green-600 dark:text-green-400' : 
                            'text-foreground'
                          }`}>
                            {section.title}
                          </span>
                          {isActive && (
                            <Badge variant="default" className="text-[10px] px-1 py-0">
                              Now
                            </Badge>
                          )}
                          {isCompleted && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 bg-green-50 border-green-200 text-green-600">
                              ✓
                            </Badge>
                          )}
                        </div>
                        <div className={`text-[11px] mt-1 ${
                          isActive ? 'text-primary/70' : 'text-muted-foreground'
                        }`}>
                          {section.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-[11px] text-center text-muted-foreground">
              💡 Click on any section to jump there
            </div>
          </div>
        )}

        {/* Enhanced Advanced Controls */}
        {showControls && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Voice Settings</h4>
              {isSettingsChanged && (
                <Badge variant="outline" className="text-xs animate-pulse">
                  Settings Updated
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium flex items-center justify-between">
                  <span>Voice Speed</span>
                  <span className="text-xs text-muted-foreground">
                    {speed[0]}x {speed[0] < 0.8 ? '(Slower)' : speed[0] > 1.1 ? '(Faster)' : '(Normal)'}
                  </span>
                </label>
                <Slider
                  value={speed}
                  onValueChange={(value) => {
                    setSpeed(value);
                    if (isPlaying) {
                      toast.info(`Speed changed to ${value[0]}x - will apply to next section`);
                    }
                  }}
                  min={0.5}
                  max={1.5}
                  step={0.05}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0.5x</span>
                  <span>1.0x</span>
                  <span>1.5x</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium flex items-center justify-between">
                  <span>Volume</span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(volume[0] * 100)}%
                  </span>
                </label>
                <Slider
                  value={volume}
                  onValueChange={(value) => {
                    setVolume(value);
                    if (isPlaying) {
                      toast.info(`Volume changed to ${Math.round(value[0] * 100)}%`);
                    }
                  }}
                  min={0.1}
                  max={1}
                  step={0.05}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>🔇</span>
                  <span>🔊</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSpeed([1]);
                  setVolume([0.8]);
                  toast.info('Settings reset to default');
                }}
                size="sm"
                className="text-xs"
              >
                Reset Settings
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onToggleEnabled}
                size="sm"
                className="text-xs"
              >
                <VolumeX className="h-3 w-3 mr-1" />
                Disable Voice
              </Button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>🎧 Use headphones for the best meditation experience</p>
          <p>✨ AI-powered natural voice with intelligent pacing</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoicePlayer;