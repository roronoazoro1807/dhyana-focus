import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import * as Progress from '@radix-ui/react-progress';
import * as Switch from '@radix-ui/react-switch';
import { cn } from '../lib/utils';

// Interface for focus session data
interface FocusSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  completed: boolean;
  taskIds: string[];
}

// Beep sound using the Web Audio API - simple and reliable
function playBeepSound(isHighPitch = true): boolean {
  try {
    // Use AudioContext with safer type handling
    const audioContext = new (window.AudioContext || 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = isHighPitch ? 1500 : 800; // Higher pitch for work, lower for break
    gainNode.gain.value = 0.5;
    
    oscillator.start();
    
    // Stop after 0.3 seconds
    setTimeout(() => {
      oscillator.stop();
      // Clean up
      setTimeout(() => {
        gainNode.disconnect();
        oscillator.disconnect();
      }, 100);
    }, 300);
    
    return true;
  } catch (error) {
    console.error('Error playing beep sound:', error);
    return false;
  }
}

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkMode, setIsWorkMode] = useState(true);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  
  // Reference to track session start time
  const sessionStartRef = useRef<Date | null>(null);
  
  // Function to play sound
  const playSound = (isWorkComplete: boolean) => {
    if (!soundsEnabled) return;
    
    // Play beep sound
    const beepSuccess = playBeepSound(isWorkComplete);
    
    // If beep fails, show visual notification
    if (!beepSuccess) {
      document.body.classList.add('flash-notification');
      setTimeout(() => {
        document.body.classList.remove('flash-notification');
      }, 500);
    }
  };
  
  useEffect(() => {
    let interval: number;
    
    if (isRunning && timeLeft > 0) {
      // If we're just starting a work session, record the start time
      if (isWorkMode && sessionStartRef.current === null) {
        sessionStartRef.current = new Date();
      }
      
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // If a work session just ended, save the session data
      if (isWorkMode) {
        saveCompletedSession();
        
        // Play work complete sound
        playSound(true);
      } else {
        // Play break complete sound
        playSound(false);
      }
      
      setIsWorkMode(!isWorkMode);
      setTimeLeft(isWorkMode ? breakDuration * 60 : workDuration * 60);
      setIsRunning(false);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isWorkMode, workDuration, breakDuration]);

  // Save completed focus session to localStorage
  const saveCompletedSession = () => {
    if (!sessionStartRef.current) return;
    
    const endTime = new Date();
    const durationMinutes = workDuration; // Use the set duration
    
    const newSession: FocusSession = {
      id: Date.now().toString(),
      startTime: sessionStartRef.current,
      endTime: endTime,
      duration: durationMinutes,
      completed: true,
      taskIds: [] // In a more advanced version, we could link to active tasks
    };
    
    // Get existing sessions from localStorage
    const existingSessions = localStorage.getItem('pomodoro-sessions');
    const sessions = existingSessions ? JSON.parse(existingSessions) : [];
    
    // Add new session and save back to localStorage
    sessions.push(newSession);
    localStorage.setItem('pomodoro-sessions', JSON.stringify(sessions));
    
    // Save data for PomodoroActivity component
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const activityData = localStorage.getItem('focus-sessions');
    let focusData = [];
    
    if (activityData) {
      try {
        focusData = JSON.parse(activityData);
      } catch (error) {
        console.error('Failed to parse focus activity data:', error);
        focusData = [];
      }
    }
    
    // Find if there's already an entry for today
    const todayIndex = focusData.findIndex((item: { date: string }) => item.date === today);
    
    if (todayIndex >= 0) {
      // Increment the count for today
      focusData[todayIndex].count += 1;
    } else {
      // Add a new entry for today
      focusData.push({
        date: today,
        count: 1
      });
    }
    
    // Save the updated focus data
    localStorage.setItem('focus-sessions', JSON.stringify(focusData));
    
    // Reset the session start reference
    sessionStartRef.current = null;
    
    console.log('Focus session saved:', newSession);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isWorkMode ? workDuration * 60 : breakDuration * 60);
    
    // If resetting during a work session, consider it incomplete
    if (isWorkMode && sessionStartRef.current) {
      sessionStartRef.current = null;
    }
  };

  const toggleMode = () => {
    setIsWorkMode(!isWorkMode);
    setIsRunning(false);
    setTimeLeft(!isWorkMode ? workDuration * 60 : breakDuration * 60);
    
    // Reset session tracking when switching modes
    sessionStartRef.current = null;
  };

  // Manual stop - consider saving partial session
  const handleStopTimer = () => {
    if (isRunning && isWorkMode && sessionStartRef.current) {
      const endTime = new Date();
      const startTime = sessionStartRef.current;
      const elapsedMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
      
      // Only save if at least 1 minute has passed
      if (elapsedMinutes >= 1) {
        const newSession: FocusSession = {
          id: Date.now().toString(),
          startTime: startTime,
          endTime: endTime,
          duration: elapsedMinutes,
          completed: false, // Marked as incomplete
          taskIds: []
        };
        
        // Get existing sessions from localStorage
        const existingSessions = localStorage.getItem('pomodoro-sessions');
        const sessions = existingSessions ? JSON.parse(existingSessions) : [];
        
        // Add new session and save back to localStorage
        sessions.push(newSession);
        localStorage.setItem('pomodoro-sessions', JSON.stringify(sessions));
        
        // Save data for PomodoroActivity component (partial sessions count as 0.5)
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const activityData = localStorage.getItem('focus-sessions');
        let focusData = [];
        
        if (activityData) {
          try {
            focusData = JSON.parse(activityData);
          } catch (error) {
            console.error('Failed to parse focus activity data:', error);
            focusData = [];
          }
        }
        
        // Find if there's already an entry for today
        const todayIndex = focusData.findIndex((item: { date: string }) => item.date === today);
        
        if (todayIndex >= 0) {
          // Increment the count for today (partial session counts as 0.5)
          focusData[todayIndex].count += 0.5;
        } else {
          // Add a new entry for today
          focusData.push({
            date: today,
            count: 0.5
          });
        }
        
        // Save the updated focus data
        localStorage.setItem('focus-sessions', JSON.stringify(focusData));
        
        console.log('Partial focus session saved:', newSession);
      }
      
      sessionStartRef.current = null;
    }
    
    setIsRunning(false);
  };

  const progress = isWorkMode
    ? ((workDuration * 60 - timeLeft) / (workDuration * 60)) * 100
    : ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">
          <span className="block">{isWorkMode ? 'कार्य समय' : 'विश्राम समय'}</span>
          <span className="block text-lg text-primary">
            {isWorkMode ? 'Work Time' : 'Break Time'}
          </span>
        </h2>
        <div className="text-7xl font-mono mb-4 text-primary drop-shadow-[0_0_8px_var(--primary)]">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      <Progress.Root
        className="relative overflow-hidden bg-gray-800 rounded-full w-full h-4"
        value={progress}
      >
        <Progress.Indicator
          className={cn(
            "h-full transition-transform duration-300 ease-in-out rounded-full",
            "bg-primary"
          )}
          style={{ transform: `translateX(-${100 - progress}%)` }}
        />
      </Progress.Root>

      <div className="flex justify-center space-x-6">
        <button
          onClick={() => isRunning ? handleStopTimer() : setIsRunning(true)}
          className="p-3 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-black transition-all"
          aria-label={isRunning ? "Pause" : "Start"}
        >
          {isRunning ? <Pause size={28} /> : <Play size={28} />}
        </button>
        <button
          onClick={resetTimer}
          className="p-3 rounded-full bg-black/50 hover:bg-primary hover:text-black transition-all"
          aria-label="Reset"
        >
          <RotateCcw size={28} />
        </button>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${isWorkMode ? 'text-primary font-medium' : 'text-gray-500'}`}>Work</span>
          <Switch.Root 
            className="w-10 h-5 bg-gray-700 rounded-full relative data-[state=checked]:bg-primary outline-none cursor-pointer"
            checked={!isWorkMode}
            onCheckedChange={toggleMode}
          >
            <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
          </Switch.Root>
          <span className={`text-sm ${!isWorkMode ? 'text-primary font-medium' : 'text-gray-500'}`}>Break</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setSoundsEnabled(!soundsEnabled)}
            className="p-2 rounded-full hover:bg-black/50"
            aria-label={soundsEnabled ? "Mute sounds" : "Enable sounds"}
            title={soundsEnabled ? "Mute notification sounds" : "Enable notification sounds"}
          >
            {soundsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-400">
            Work (min)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={workDuration}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value > 0 && value <= 60) {
                setWorkDuration(value);
                if (isWorkMode && !isRunning) {
                  setTimeLeft(value * 60);
                }
              }
            }}
            className="w-full px-3 py-1 rounded border border-gray-700 bg-black/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-gray-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-400">
            Break (min)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={breakDuration}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value > 0 && value <= 30) {
                setBreakDuration(value);
                if (!isWorkMode && !isRunning) {
                  setTimeLeft(value * 60);
                }
              }
            }}
            className="w-full px-3 py-1 rounded border border-gray-700 bg-black/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-gray-200"
          />
        </div>
      </div>
    </div>
  );
}