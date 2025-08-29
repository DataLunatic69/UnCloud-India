import { useState, useCallback, useEffect } from 'react';
import SpotifyApi from 'spotify-web-api-node';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  duration_ms: number;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
}

interface MeditationPlaylist {
  id: string;
  name: string;
  tracks: SpotifyTrack[];
  total: number;
}

export const useSpotify = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spotifyApi] = useState(() => {
    // For demo purposes, we'll use public playlists and search
    // In production, you'd need proper OAuth setup
    return new SpotifyApi({
      clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      clientSecret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET,
    });
  });

  // Fallback meditation tracks (when Spotify isn't available)
  const fallbackTracks: SpotifyTrack[] = [
    {
      id: 'fallback-1',
      name: 'Peaceful Meditation',
      artists: [{ name: 'Nature Sounds' }],
      preview_url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3', // Working sample audio
      external_urls: { spotify: '#' },
      duration_ms: 300000, // 5 minutes
      album: {
        name: 'Meditation Collection',
        images: [{ url: '/placeholder.svg', height: 300, width: 300 }]
      }
    },
    {
      id: 'fallback-2',
      name: 'Deep Relaxation',
      artists: [{ name: 'Ambient Sounds' }],
      preview_url: 'https://file-examples.com/storage/fe68c8a7735d7c0ed7bb0cf/2017/11/file_example_MP3_700KB.mp3', // Working sample audio
      external_urls: { spotify: '#' },
      duration_ms: 600000, // 10 minutes
      album: {
        name: 'Relaxation Music',
        images: [{ url: '/placeholder.svg', height: 300, width: 300 }]
      }
    },
    {
      id: 'fallback-3',
      name: 'Mindful Breathing',
      artists: [{ name: 'Meditation Music' }],
      preview_url: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav', // Working sample audio
      external_urls: { spotify: '#' },
      duration_ms: 480000, // 8 minutes
      album: {
        name: 'Mindfulness',
        images: [{ url: '/placeholder.svg', height: 300, width: 300 }]
      }
    }
  ];

  const searchMeditationMusic = useCallback(async (query: string = 'meditation music', limit: number = 20): Promise<SpotifyTrack[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to get client credentials token first
      const clientCredentialsGrant = await spotifyApi.clientCredentialsGrant();
      spotifyApi.setAccessToken(clientCredentialsGrant.body.access_token);

      const searchResults = await spotifyApi.searchTracks(query, { limit });
      
      const tracks: SpotifyTrack[] = searchResults.body.tracks?.items.map((track: any) => ({
        id: track.id,
        name: track.name,
        artists: track.artists,
        preview_url: track.preview_url,
        external_urls: track.external_urls,
        duration_ms: track.duration_ms,
        album: track.album
      })) || [];

      setIsLoading(false);
      return tracks.length > 0 ? tracks : fallbackTracks;
    } catch (error) {
      console.warn('Spotify search failed, using fallback tracks:', error);
      setError('Using offline meditation music');
      setIsLoading(false);
      return fallbackTracks;
    }
  }, [spotifyApi]);

  const getMeditationPlaylists = useCallback(async (): Promise<MeditationPlaylist[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Search for meditation playlists
      const queries = ['meditation', 'relaxation music', 'mindfulness', 'sleep music'];
      const allPlaylists: MeditationPlaylist[] = [];

      for (const query of queries) {
        try {
          const searchResults = await spotifyApi.searchPlaylists(query, { limit: 5 });
          const playlists = searchResults.body.playlists?.items || [];

          for (const playlist of playlists) {
            if (playlist && playlist.id) {
              // Get playlist tracks
              try {
                const playlistTracks = await spotifyApi.getPlaylistTracks(playlist.id, { limit: 10 });
                const tracks: SpotifyTrack[] = playlistTracks.body.items
                  .filter((item: any) => item.track && item.track.preview_url)
                  .map((item: any) => ({
                    id: item.track.id,
                    name: item.track.name,
                    artists: item.track.artists,
                    preview_url: item.track.preview_url,
                    external_urls: item.track.external_urls,
                    duration_ms: item.track.duration_ms,
                    album: item.track.album
                  }));

                allPlaylists.push({
                  id: playlist.id,
                  name: playlist.name,
                  tracks,
                  total: tracks.length
                });
              } catch (playlistError) {
                console.warn(`Failed to get tracks for playlist ${playlist.id}:`, playlistError);
              }
            }
          }
        } catch (queryError) {
          console.warn(`Failed to search for ${query}:`, queryError);
        }
      }

      setIsLoading(false);
      
      // Return playlists or fallback
      return allPlaylists.length > 0 ? allPlaylists : [
        {
          id: 'fallback',
          name: 'Meditation Music',
          tracks: fallbackTracks,
          total: fallbackTracks.length
        }
      ];
    } catch (error) {
      console.warn('Failed to get meditation playlists, using fallback:', error);
      setError('Using offline meditation music');
      setIsLoading(false);
      return [
        {
          id: 'fallback',
          name: 'Meditation Music',
          tracks: fallbackTracks,
          total: fallbackTracks.length
        }
      ];
    }
  }, [spotifyApi]);

  const getRecommendedTracks = useCallback(async (seedGenres: string[] = ['ambient', 'chill', 'meditation']): Promise<SpotifyTrack[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const recommendations = await spotifyApi.getRecommendations({
        seed_genres: seedGenres,
        target_valence: 0.3, // Calm, peaceful
        target_energy: 0.2,  // Low energy
        target_danceability: 0.1, // Not danceable
        limit: 20
      });

      const tracks: SpotifyTrack[] = recommendations.body.tracks.map((track: any) => ({
        id: track.id,
        name: track.name,
        artists: track.artists,
        preview_url: track.preview_url,
        external_urls: track.external_urls,
        duration_ms: track.duration_ms,
        album: track.album
      }));

      setIsLoading(false);
      return tracks.length > 0 ? tracks : fallbackTracks;
    } catch (error) {
      console.warn('Failed to get recommendations, using fallback:', error);
      setError('Using offline meditation music');
      setIsLoading(false);
      return fallbackTracks;
    }
  }, [spotifyApi]);

  const getCategoryPlaylists = useCallback(async (category: string): Promise<SpotifyTrack[]> => {
    // Enhanced mapping of meditation categories to music search terms
    const musicQueries: Record<string, string> = {
      'stress-relief': 'meditation relaxation stress relief calm peaceful',
      'anxiety': 'anxiety relief meditation calm soothing peaceful music',
      'sleep': 'sleep meditation music peaceful deep relaxation night sounds',
      'focus': 'focus concentration meditation ambient study music',
      'self-compassion': 'self love meditation healing peaceful compassion music',
      'family-pressure': 'calming meditation peace stress relief soothing',
      'exam-anxiety': 'study meditation concentration calm focus music',
      
      // Additional keywords from custom prompts
      'calm': 'calm meditation peaceful relaxation music',
      'peace': 'peaceful meditation tranquil serene music',
      'healing': 'healing meditation music therapeutic peaceful',
      'confidence': 'confidence meditation empowerment peaceful music',
      'love': 'loving kindness meditation peaceful heart opening music'
    };

    const query = musicQueries[category] || `${category} meditation music`;
    
    try {
      // Get more tracks for better variety
      const tracks = await searchMeditationMusic(query, 15);
      
      // Filter tracks to get ones with preview URLs (playable tracks)
      const playableTracks = tracks.filter(track => track.preview_url !== null);
      
      if (playableTracks.length > 0) {
        console.log(`Found ${playableTracks.length} playable tracks for ${category}`);
        return playableTracks;
      } else {
        // Try with a simpler query if no playable tracks found
        const simpleTracks = await searchMeditationMusic('meditation music', 10);
        const simplePlayable = simpleTracks.filter(track => track.preview_url !== null);
        return simplePlayable.length > 0 ? simplePlayable : fallbackTracks;
      }
    } catch (error) {
      console.error('Error in getCategoryPlaylists:', error);
      return fallbackTracks;
    }
  }, [searchMeditationMusic, fallbackTracks]);

  // Initialize Spotify client credentials on mount
  useEffect(() => {
    const initializeSpotify = async () => {
      if (import.meta.env.VITE_SPOTIFY_CLIENT_ID && import.meta.env.VITE_SPOTIFY_CLIENT_SECRET) {
        try {
          const clientCredentialsGrant = await spotifyApi.clientCredentialsGrant();
          spotifyApi.setAccessToken(clientCredentialsGrant.body.access_token);
        } catch (error) {
          console.warn('Failed to initialize Spotify client credentials:', error);
          setError('Spotify unavailable - using offline music');
        }
      } else {
        console.warn('Spotify credentials not found in environment variables');
        setError('Spotify configuration needed');
      }
    };

    initializeSpotify();
  }, [spotifyApi]);

  return {
    isLoading,
    error,
    searchMeditationMusic,
    getMeditationPlaylists,
    getRecommendedTracks,
    getCategoryPlaylists,
    fallbackTracks
  };
};

export type { SpotifyTrack, MeditationPlaylist };