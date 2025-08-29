import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Repeat, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Howl, Howler } from 'howler';

interface Track {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  preview_url: string | null;
  duration_ms: number;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
}

interface MeditationPlayerProps {
  tracks: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onTrackChange: (index: number) => void;
  className?: string;
}

export const MeditationPlayer: React.FC<MeditationPlayerProps> = ({
  tracks,
  currentTrackIndex,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onTrackChange,
  className = ""
}) => {
  const [volume, setVolume] = useState([80]);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const howlRef = useRef<Howl | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentTrack = tracks[currentTrackIndex];

  // Initialize Howler with current track
  useEffect(() => {
    if (currentTrack && currentTrack.preview_url) {
      // Stop previous audio
      if (howlRef.current) {
        howlRef.current.stop();
        howlRef.current.unload();
      }

      // Create new Howl instance
      howlRef.current = new Howl({
        src: [currentTrack.preview_url],
        html5: true,
        volume: (isMuted ? 0 : volume[0]) / 100,
        loop: isLooping,
        onplay: () => {
          setDuration(howlRef.current?.duration() || 0);
          startProgressTracking();
        },
        onpause: () => {
          stopProgressTracking();
        },
        onstop: () => {
          stopProgressTracking();
          setProgress(0);
        },
        onend: () => {
          stopProgressTracking();
          if (!isLooping) {
            handleAutoNext();
          }
        },
        onloaderror: (id, error) => {
          console.error('Audio load error:', error);
        },
        onplayerror: (id, error) => {
          console.error('Audio play error:', error);
        }
      });
    }

    return () => {
      if (howlRef.current) {
        howlRef.current.stop();
        howlRef.current.unload();
      }
      stopProgressTracking();
    };
  }, [currentTrack, isLooping]);

  // Handle volume changes
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(isMuted ? 0 : volume[0] / 100);
    }
  }, [volume, isMuted]);

  // Handle play/pause
  useEffect(() => {
    if (howlRef.current) {
      if (isPlaying) {
        howlRef.current.play();
      } else {
        howlRef.current.pause();
      }
    }
  }, [isPlaying]);

  const startProgressTracking = () => {
    stopProgressTracking();
    progressIntervalRef.current = setInterval(() => {
      if (howlRef.current && howlRef.current.playing()) {
        setProgress(howlRef.current.seek() || 0);
      }
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleAutoNext = () => {
    if (isShuffling) {
      const nextIndex = Math.floor(Math.random() * tracks.length);
      onTrackChange(nextIndex);
    } else if (currentTrackIndex < tracks.length - 1) {
      onNext();
    } else {
      // End of playlist
      onPause();
      setProgress(0);
    }
  };

  const handleProgressChange = (newProgress: number[]) => {
    const seekTime = newProgress[0];
    if (howlRef.current) {
      howlRef.current.seek(seekTime);
      setProgress(seekTime);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
    if (howlRef.current) {
      howlRef.current.loop(!isLooping);
    }
  };

  const toggleShuffle = () => {
    setIsShuffling(!isShuffling);
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <Card className={`bg-gradient-to-r from-primary/10 via-primary/5 to-background ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          {/* Album Art */}
          <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            {currentTrack.album.images?.[0]?.url ? (
              <img 
                src={currentTrack.album.images[0].url} 
                alt={currentTrack.album.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-primary" />
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{currentTrack.name}</h4>
            <p className="text-xs text-muted-foreground truncate">
              {currentTrack.artists.map(artist => artist.name).join(', ')}
            </p>
            <p className="text-xs text-muted-foreground">{currentTrack.album.name}</p>
          </div>

          {/* Track Status */}
          <div className="text-right">
            <Badge variant="outline" className="text-xs">
              {currentTrackIndex + 1} of {tracks.length}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[progress]}
            onValueChange={handleProgressChange}
            max={duration || 30} // Default 30s for preview
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration || 30)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleShuffle}
              className={isShuffling ? 'text-primary' : 'text-muted-foreground'}
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              disabled={!isShuffling && currentTrackIndex === 0}
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={isPlaying ? onPause : onPlay}
              className="w-10 h-10 rounded-full"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              disabled={!isShuffling && currentTrackIndex === tracks.length - 1}
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLoop}
              className={isLooping ? 'text-primary' : 'text-muted-foreground'}
            >
              <Repeat className="w-4 h-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 min-w-0 flex-1 max-w-32">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
            >
              {isMuted || volume[0] === 0 ? 
                <VolumeX className="w-4 h-4" /> : 
                <Volume2 className="w-4 h-4" />
              }
            </Button>
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>
        </div>

        {/* Track List Preview (if multiple tracks) */}
        {tracks.length > 1 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">Meditation Playlist</p>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {tracks.slice(0, 3).map((track, index) => (
                <div
                  key={track.id}
                  className={`flex items-center gap-2 text-xs p-1 rounded cursor-pointer hover:bg-muted/50 ${
                    index === currentTrackIndex ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  }`}
                  onClick={() => onTrackChange(index)}
                >
                  <span className="w-4 text-center">{index + 1}</span>
                  <span className="flex-1 truncate">{track.name}</span>
                </div>
              ))}
              {tracks.length > 3 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  +{tracks.length - 3} more tracks
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};