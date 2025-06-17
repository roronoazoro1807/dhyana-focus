import { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Pause, VolumeX } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';
import ReactPlayer from 'react-player/youtube';

interface Sound {
  id: string;
  name: string;
  emoji: string;
  url: string;
}

// Create a global state for ambient sounds
// This will persist even when the component is unmounted
interface AmbientSoundState {
  activeSound: string | null;
  volume: number;
  isMuted: boolean;
  isPlaying: boolean;
}

// Initialize with default values
let globalAmbientState: AmbientSoundState = {
  activeSound: null,
  volume: 50,
  isMuted: false,
  isPlaying: false
};

// Create a list of callbacks to update components when global state changes
const stateUpdateCallbacks: ((state: AmbientSoundState) => void)[] = [];

// Function to update global state and notify all listeners
function updateGlobalAmbientState(newState: Partial<AmbientSoundState>) {
  globalAmbientState = { ...globalAmbientState, ...newState };
  stateUpdateCallbacks.forEach(callback => callback(globalAmbientState));
}

export function AmbientSounds() {
  const [sounds] = useState<Sound[]>([
    { id: 'rain', name: 'Rain', emoji: '🌧️', url: 'https://www.youtube.com/watch?v=mPZkdNFkNps' },
    { id: 'forest', name: 'Forest', emoji: '🌲', url: 'https://www.youtube.com/watch?v=xNN7iTA57jM' },
    { id: 'waves', name: 'Ocean Waves', emoji: '🌊', url: 'https://www.youtube.com/watch?v=WHPEKLQID4U' },
    { id: 'fire', name: 'Campfire', emoji: '🔥', url: 'https://www.youtube.com/watch?v=qsOUv9EzKsg' },
    { id: 'cafe', name: 'Cafe', emoji: '☕', url: 'https://www.youtube.com/watch?v=BOdLmxy06H0' },
    { id: 'nature', name: 'Birds & Wind', emoji: '🍃', url: 'https://www.youtube.com/watch?v=Qm846KdZN_c' },
  ]);

  // Local state that syncs with global state
  const [activeSound, setActiveSound] = useState<string | null>(globalAmbientState.activeSound);
  const [volume, setVolume] = useState(globalAmbientState.volume);
  const [isMuted, setIsMuted] = useState(globalAmbientState.isMuted);
  const [isPlaying, setIsPlaying] = useState(globalAmbientState.isPlaying);
  const [isLoading, setIsLoading] = useState(false);
  
  const playerRef = useRef<ReactPlayer | null>(null);

  // Sync local state with global state
  useEffect(() => {
    // Function to update local state when global state changes
    const handleStateUpdate = (state: AmbientSoundState) => {
      setActiveSound(state.activeSound);
      setVolume(state.volume);
      setIsMuted(state.isMuted);
      setIsPlaying(state.isPlaying);
    };
    
    // Register this component as a listener
    stateUpdateCallbacks.push(handleStateUpdate);
    
    // Clean up when component unmounts
    return () => {
      const index = stateUpdateCallbacks.indexOf(handleStateUpdate);
      if (index !== -1) {
        stateUpdateCallbacks.splice(index, 1);
      }
    };
  }, []);

  const toggleSound = (soundId: string) => {
    if (activeSound === soundId) {
      // Stop current sound
      updateGlobalAmbientState({ 
        isPlaying: false,
        activeSound: null
      });
    } else {
      // Play new sound
      setIsLoading(true);
      updateGlobalAmbientState({ 
        activeSound: soundId,
        isPlaying: true
      });
    }
  };

  const toggleMute = () => {
    if (!activeSound) return;
    updateGlobalAmbientState({ isMuted: !isMuted });
  };

  const handleReady = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    updateGlobalAmbientState({ 
      isPlaying: false,
      activeSound: null
    });
  };

  const getActiveSound = () => {
    return sounds.find(s => s.id === activeSound);
  };

  // Update volume in global state when local volume changes
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    updateGlobalAmbientState({ volume: newVolume });
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">
          <span className="block">ध्वनि वातावरण</span>
          <span className="block text-lg text-primary">Ambient Sounds</span>
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {sounds.map((sound) => (
          <button
            key={sound.id}
            onClick={() => toggleSound(sound.id)}
            className={`p-4 rounded-lg flex flex-col items-center justify-center transition-all ${
              activeSound === sound.id 
                ? 'bg-primary/20 text-primary border border-primary/50' 
                : 'bg-black/30 hover:bg-black/50 border border-gray-800'
            }`}
            disabled={isLoading && activeSound !== sound.id}
          >
            <span className="text-2xl mb-1">{sound.emoji}</span>
            <span className="text-sm">{sound.name}</span>
            <span className="mt-2">
              {activeSound === sound.id ? 
                (isLoading ? 
                  <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span> : 
                  <Pause size={16} />
                ) : 
                <Play size={16} />
              }
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-3 bg-black/30 p-3 rounded-lg">
        <button 
          onClick={toggleMute}
          className="p-2 rounded-full hover:bg-black/50"
          aria-label={isMuted ? "Unmute" : "Mute"}
          disabled={!activeSound}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[volume]}
          onValueChange={(value) => handleVolumeChange(value[0])}
          max={100}
          step={1}
          disabled={!activeSound}
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
      
      {/* YouTube player - now always in DOM but with zero size */}
      <div className="hidden">
        {activeSound && (
          <ReactPlayer
            ref={playerRef}
            url={getActiveSound()?.url}
            playing={isPlaying}
            volume={isMuted ? 0 : volume / 100}
            loop={true}
            width="0"
            height="0"
            onReady={handleReady}
            onError={handleError}
            config={{
              playerVars: { 
                controls: 0,
                showinfo: 0,
                modestbranding: 1,
                origin: window.location.origin
              }
            }}
          />
        )}
      </div>
      
      <div className="text-center text-xs text-gray-500 mt-4">
        <p>Ambient sounds from YouTube</p>
        {activeSound && (
          <p className="mt-1 text-primary">
            {getActiveSound()?.name} is currently playing
            {isPlaying ? "" : " (paused)"}
          </p>
        )}
      </div>
    </div>
  );
}

// Create a persistent player component that will always be in the DOM
export function PersistentAmbientPlayer() {
  const [state, setState] = useState(globalAmbientState);
  
  // Listen for global state changes
  useEffect(() => {
    const handleStateUpdate = (newState: AmbientSoundState) => {
      setState({ ...newState });
    };
    
    stateUpdateCallbacks.push(handleStateUpdate);
    
    return () => {
      const index = stateUpdateCallbacks.indexOf(handleStateUpdate);
      if (index !== -1) {
        stateUpdateCallbacks.splice(index, 1);
      }
    };
  }, []);
  
  // Get the active sound URL
  const getActiveSoundUrl = () => {
    if (!state.activeSound) return '';
    
    const sounds = [
      { id: 'rain', url: 'https://www.youtube.com/watch?v=mPZkdNFkNps' },
      { id: 'forest', url: 'https://www.youtube.com/watch?v=xNN7iTA57jM' },
      { id: 'waves', url: 'https://www.youtube.com/watch?v=WHPEKLQID4U' },
      { id: 'fire', url: 'https://www.youtube.com/watch?v=qsOUv9EzKsg' },
      { id: 'cafe', url: 'https://www.youtube.com/watch?v=BOdLmxy06H0' },
      { id: 'nature', url: 'https://www.youtube.com/watch?v=Qm846KdZN_c' },
    ];
    
    return sounds.find(s => s.id === state.activeSound)?.url || '';
  };
  
  if (!state.activeSound) return null;
  
  return (
    <div style={{ display: 'none' }}>
      <ReactPlayer
        url={getActiveSoundUrl()}
        playing={state.isPlaying}
        volume={state.isMuted ? 0 : state.volume / 100}
        loop={true}
        width="0"
        height="0"
        config={{
          playerVars: { 
            controls: 0,
            showinfo: 0,
            modestbranding: 1,
            origin: window.location.origin
          }
        }}
      />
    </div>
  );
} 