import { useState, useEffect, ChangeEvent } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, Plus } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Slider from '@radix-ui/react-slider';
import ReactPlayer from 'react-player';

interface Track {
  id: string;
  title: string;
  url: string;
  source: 'youtube' | 'spotify' | 'custom';
}

export function MusicPlayer() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [newTrackUrl, setNewTrackUrl] = useState('');
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load tracks from localStorage on component mount
  useEffect(() => {
    const savedTracks = localStorage.getItem('music-tracks');
    if (savedTracks) {
      try {
        setTracks(JSON.parse(savedTracks));
      } catch (error) {
        console.error('Failed to parse saved tracks:', error);
      }
    }
  }, []);

  // Save tracks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('music-tracks', JSON.stringify(tracks));
  }, [tracks]);

  const addTrack = () => {
    if (!newTrackUrl) return;
    
    const id = Date.now().toString();
    const source = newTrackUrl.includes('youtube') ? 'youtube' : 
                  newTrackUrl.includes('spotify') ? 'spotify' : 'custom';
    
    setTracks([...tracks, {
      id,
      title: newTrackTitle || `Track ${tracks.length + 1}`,
      url: newTrackUrl,
      source
    }]);
    setNewTrackUrl('');
    setNewTrackTitle('');
    setIsDialogOpen(false);
  };

  const removeTrack = (id: string) => {
    const newTracks = tracks.filter((track: Track) => track.id !== id);
    setTracks(newTracks);
    if (newTracks.length === 0) {
      setIsPlaying(false);
    } else if (currentTrack >= newTracks.length) {
      setCurrentTrack(newTracks.length - 1);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">
          <span className="block">संगीत वादक</span>
          <span className="block text-lg text-primary">Music Player</span>
        </h2>
      </div>

      <div className="bg-black/40 backdrop-blur-md rounded-lg p-4">
        {tracks.length > 0 ? (
          <>
            <div className="relative aspect-video mb-4 bg-black rounded-lg overflow-hidden border border-primary/30">
              <ReactPlayer
                url={tracks[currentTrack]?.url}
                playing={isPlaying}
                volume={volume / 100}
                width="100%"
                height="100%"
                onEnded={() => setCurrentTrack((current: number) => (current + 1) % tracks.length)}
                controls={true}
                config={{
                  youtube: {
                    playerVars: { 
                      showinfo: 1,
                      origin: window.location.origin
                    }
                  }
                }}
              />
            </div>

            <div className="text-center mb-2 font-medium text-primary">
              {tracks[currentTrack]?.title}
            </div>

            <div className="flex items-center justify-center space-x-6 mb-4">
              <button
                onClick={() => setCurrentTrack((prev: number) => prev === 0 ? tracks.length - 1 : prev - 1)}
                className="p-3 rounded-full bg-black/50 hover:bg-primary hover:text-black transition-all"
                aria-label="Previous track"
              >
                <SkipBack size={24} />
              </button>
              
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-4 bg-primary/20 text-primary rounded-full hover:bg-primary hover:text-black transition-all"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} />}
              </button>

              <button
                onClick={() => setCurrentTrack((prev: number) => (prev + 1) % tracks.length)}
                className="p-3 rounded-full bg-black/50 hover:bg-primary hover:text-black transition-all"
                aria-label="Next track"
              >
                <SkipForward size={24} />
              </button>
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <Volume2 size={20} className="text-primary" />
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={[volume]}
                onValueChange={(value: number[]) => setVolume(value[0])}
                max={100}
                step={1}
              >
                <Slider.Track className="bg-gray-700 relative grow rounded-full h-1">
                  <Slider.Range className="absolute bg-primary rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb
                  className="block w-4 h-4 bg-primary rounded-full hover:bg-primary/80"
                  aria-label="Volume"
                />
              </Slider.Root>
            </div>

            <div className="max-h-40 overflow-y-auto mb-4 bg-black/50 rounded-lg p-2">
              <h3 className="font-medium mb-2 text-center text-primary">Playlist</h3>
              <ul className="space-y-1">
                {tracks.map((track: Track, index: number) => (
                  <li 
                    key={track.id} 
                    className={`flex justify-between items-center p-2 rounded ${currentTrack === index ? 'bg-primary/20 text-primary' : 'hover:bg-black/70'}`}
                  >
                    <button 
                      className="text-left flex-1 truncate"
                      onClick={() => {
                        setCurrentTrack(index);
                        setIsPlaying(true);
                      }}
                    >
                      {track.title}
                    </button>
                    <button 
                      onClick={() => removeTrack(track.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                      aria-label="Remove track"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Music size={48} className="mx-auto mb-4 text-primary/50" />
            <p className="text-gray-400">No tracks added yet</p>
          </div>
        )}

        <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Dialog.Trigger asChild>
            <button className="w-full mt-4 py-2 px-4 bg-primary/20 text-primary rounded-lg hover:bg-primary hover:text-black flex items-center justify-center gap-2 transition-all">
              <Plus size={20} />
              Add Track
            </button>
          </Dialog.Trigger>
          
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 border border-primary/30 rounded-lg p-6 w-[90vw] max-w-md shadow-[0_0_15px_rgba(var(--primary),0.3)] z-50">
              <Dialog.Title className="text-xl font-semibold mb-4 text-primary">Add New Track</Dialog.Title>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="track-title" className="block text-sm font-medium mb-1 text-gray-300">
                    Track Title
                  </label>
                  <input
                    id="track-title"
                    type="text"
                    value={newTrackTitle}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTrackTitle(e.target.value)}
                    placeholder="Enter track title"
                    className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-black/50 text-gray-200 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="track-url" className="block text-sm font-medium mb-1 text-gray-300">
                    YouTube URL
                  </label>
                  <input
                    id="track-url"
                    type="text"
                    value={newTrackUrl}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTrackUrl(e.target.value)}
                    placeholder="Enter YouTube URL"
                    className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-black/50 text-gray-200 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
                  </p>
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Dialog.Close asChild>
                    <button className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700">
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    onClick={addTrack}
                    className="px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-black transition-all"
                  >
                    Add Track
                  </button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}