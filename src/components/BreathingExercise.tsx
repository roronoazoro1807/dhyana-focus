import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Info } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  inhale: number;
  hold1?: number;
  exhale: number;
  hold2?: number;
  color: string;
}

export function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalCycles, setTotalCycles] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState<string>('box');
  const [infoOpen, setInfoOpen] = useState(false);
  
  const animationRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const cycleRef = useRef<number>(0);

  const breathingPatterns: BreathingPattern[] = [
    {
      id: 'box',
      name: 'Box Breathing',
      description: 'Inhale, hold, exhale, and hold again for equal counts. Great for stress reduction and improving concentration.',
      inhale: 4,
      hold1: 4,
      exhale: 4,
      hold2: 4,
      color: 'var(--primary)'
    },
    {
      id: '478',
      name: '4-7-8 Breathing',
      description: 'Inhale for 4, hold for 7, exhale for 8. Helps reduce anxiety and aids sleep.',
      inhale: 4,
      hold1: 7,
      exhale: 8,
      color: '#9c27b0'
    },
    {
      id: 'deep',
      name: 'Deep Breathing',
      description: 'Simple deep breathing with longer exhales to activate the parasympathetic nervous system.',
      inhale: 4,
      exhale: 6,
      color: '#2196f3'
    }
  ];

  const currentPattern = breathingPatterns.find(p => p.id === selectedPattern) || breathingPatterns[0];

  // Update animation based on the current phase
  const updateAnimation = (phase: string) => {
    if (!animationRef.current) return;
    
    // Reset animations
    animationRef.current.classList.remove('scale-100', 'scale-125', 'opacity-50');
    
    // Apply new animation based on phase
    switch (phase) {
      case 'inhale':
        animationRef.current.classList.add('scale-125');
        break;
      case 'exhale':
        animationRef.current.classList.add('scale-100', 'opacity-50');
        break;
      case 'hold1':
        animationRef.current.classList.add('scale-125');
        break;
      case 'hold2':
        animationRef.current.classList.add('scale-100');
        break;
    }
  };

  // Start a new phase with the given duration
  const startPhase = (phase: 'inhale' | 'hold1' | 'exhale' | 'hold2', duration: number) => {
    setCurrentPhase(phase);
    setSecondsLeft(duration);
    updateAnimation(phase);
  };

  // Move to the next phase in the breathing cycle
  const moveToNextPhase = () => {
    switch (currentPhase) {
      case 'inhale':
        if (currentPattern.hold1) {
          startPhase('hold1', currentPattern.hold1);
        } else {
          startPhase('exhale', currentPattern.exhale);
        }
        break;
      case 'hold1':
        startPhase('exhale', currentPattern.exhale);
        break;
      case 'exhale':
        if (currentPattern.hold2) {
          startPhase('hold2', currentPattern.hold2);
        } else {
          // Complete one cycle
          cycleRef.current += 1;
          setTotalCycles(cycleRef.current);
          startPhase('inhale', currentPattern.inhale);
        }
        break;
      case 'hold2':
        // Complete one cycle
        cycleRef.current += 1;
        setTotalCycles(cycleRef.current);
        startPhase('inhale', currentPattern.inhale);
        break;
    }
  };

  // Main effect to handle the breathing timer
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // If active, start the timer
    if (isActive) {
      // Initialize if needed
      if (secondsLeft === 0) {
        startPhase('inhale', currentPattern.inhale);
      }

      // Start the interval
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft(prev => {
          // When we reach 0, move to the next phase
          if (prev <= 1) {
            moveToNextPhase();
            return 0; // This will be overridden by startPhase
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, currentPattern, currentPhase]);

  // Reset the exercise
  const resetExercise = () => {
    setIsActive(false);
    setCurrentPhase('inhale');
    setSecondsLeft(0);
    setTotalCycles(0);
    cycleRef.current = 0;
    
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (animationRef.current) {
      animationRef.current.classList.remove('scale-100', 'scale-125', 'opacity-50');
    }
  };

  // Get the text instruction for the current phase
  const getInstructionText = () => {
    switch (currentPhase) {
      case 'inhale': return 'Inhale';
      case 'hold1': return 'Hold';
      case 'exhale': return 'Exhale';
      case 'hold2': return 'Hold';
      default: return '';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-center">
          <span className="block">श्वास व्यायाम</span>
          <span className="block text-lg text-primary">Breathing Exercise</span>
        </h2>
        <Dialog.Root open={infoOpen} onOpenChange={setInfoOpen}>
          <Dialog.Trigger asChild>
            <button className="p-2 rounded-full hover:bg-black/30">
              <Info size={20} className="text-primary" />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 border border-primary/30 rounded-lg p-6 w-[90vw] max-w-md shadow-[0_0_15px_rgba(var(--primary),0.3)] z-50">
              <Dialog.Title className="text-xl font-semibold mb-4 text-primary">{currentPattern.name}</Dialog.Title>
              <p className="mb-4 text-gray-300">{currentPattern.description}</p>
              <div className="mb-4">
                <h3 className="font-medium mb-2 text-primary">Pattern:</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-300">
                  <li>Inhale: {currentPattern.inhale} seconds</li>
                  {currentPattern.hold1 && <li>Hold: {currentPattern.hold1} seconds</li>}
                  <li>Exhale: {currentPattern.exhale} seconds</li>
                  {currentPattern.hold2 && <li>Hold: {currentPattern.hold2} seconds</li>}
                </ul>
              </div>
              <div className="flex justify-end">
                <Dialog.Close asChild>
                  <button className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary hover:text-black">
                    Close
                  </button>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <div className="flex justify-center mb-6">
        <div className="relative">
          <div 
            ref={animationRef}
            className="w-40 h-40 rounded-full bg-primary/20 border-2 border-primary transition-all duration-1000 flex items-center justify-center"
            style={{ borderColor: currentPattern.color }}
          >
            {isActive || secondsLeft > 0 ? (
              <div className="text-center">
                <div className="text-2xl font-semibold text-primary">{getInstructionText()}</div>
                <div className="text-4xl">{secondsLeft}</div>
              </div>
            ) : (
              <div className="text-center text-primary">
                <div>Start</div>
                <div>Breathing</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setIsActive(!isActive)}
          className="p-3 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-black transition-all"
          aria-label={isActive ? "Pause" : "Start"}
        >
          {isActive ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button
          onClick={resetExercise}
          className="p-3 rounded-full bg-black/50 hover:bg-primary hover:text-black transition-all"
          aria-label="Reset"
          disabled={!isActive && totalCycles === 0}
        >
          <RotateCcw size={24} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {breathingPatterns.map((pattern) => (
          <button
            key={pattern.id}
            onClick={() => {
              setSelectedPattern(pattern.id);
              if (isActive) {
                resetExercise();
                setTimeout(() => {
                  setIsActive(true);
                }, 100);
              }
            }}
            className={`p-2 rounded-lg text-center transition-all ${
              selectedPattern === pattern.id 
                ? 'bg-primary/20 text-primary border border-primary/50' 
                : 'bg-black/30 hover:bg-black/50 border border-gray-800'
            }`}
            style={{ 
              borderColor: selectedPattern === pattern.id ? pattern.color : undefined,
              color: selectedPattern === pattern.id ? pattern.color : undefined
            }}
          >
            {pattern.name}
          </button>
        ))}
      </div>

      {totalCycles > 0 && (
        <div className="text-center text-gray-400">
          Completed cycles: {totalCycles}
        </div>
      )}
    </div>
  );
} 