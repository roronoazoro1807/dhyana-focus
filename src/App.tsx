import { DigitalClock } from './components/DigitalClock';
import { PomodoroTimer } from './components/PomodoroTimer';
import { TaskList } from './components/TaskList';
import { MusicPlayer } from './components/MusicPlayer';
import { ThemeSelector } from './components/ThemeSelector';
import { AmbientSounds, PersistentAmbientPlayer } from './components/AmbientSounds';
import { BreathingExercise } from './components/BreathingExercise';
import { GoalSetting } from './components/GoalSetting';
import { FocusAnalytics } from './components/FocusAnalytics';
import { QuickNotes } from './components/QuickNotes';
import { Calendar } from './components/Calendar';
import { useThemeStore } from './lib/store';
import { useState } from 'react';

function App() {
  const { theme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'focus' | 'sounds' | 'breathing' | 'goals' | 'analytics'>('focus');

  return (
    <div className={`min-h-screen bg-black text-gray-100 theme-${theme}`}>
      {/* Neon glow background effect */}
      <div className="fixed inset-0 bg-black">
        <div className="absolute inset-0 opacity-20 bg-gradient-radial from-transparent via-transparent to-primary blur-3xl"></div>
      </div>
      
      {/* Persistent ambient player that stays mounted regardless of active tab */}
      <PersistentAmbientPlayer />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with theme selector */}
        <div className="flex justify-end mb-4">
          <ThemeSelector />
        </div>
        
        {/* Main title and clock in center */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2 text-primary">
            <span className="block">ध्यान</span>
            <span className="block text-4xl mt-1">Focus</span>
          </h1>
          <p className="text-gray-400 mb-6">
            <span className="block">एकाग्रता और उत्पादकता के लिए एक शांत स्थान</span>
            <span className="block">A peaceful space for focus</span>
          </p>
          <div className="flex justify-center">
            <DigitalClock />
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex justify-center mb-8 overflow-x-auto">
          <div className="bg-black/30 backdrop-blur-md rounded-full p-1 inline-flex">
            <button 
              onClick={() => setActiveTab('focus')}
              className={`px-4 py-2 rounded-full transition-all ${activeTab === 'focus' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Focus
            </button>
            <button 
              onClick={() => setActiveTab('sounds')}
              className={`px-4 py-2 rounded-full transition-all ${activeTab === 'sounds' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Sounds
            </button>
            <button 
              onClick={() => setActiveTab('breathing')}
              className={`px-4 py-2 rounded-full transition-all ${activeTab === 'breathing' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Breathing
            </button>
            <button 
              onClick={() => setActiveTab('goals')}
              className={`px-4 py-2 rounded-full transition-all ${activeTab === 'goals' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Goals
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-full transition-all ${activeTab === 'analytics' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Main content based on active tab */}
        {activeTab === 'focus' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Work Time & Tasks */}
            <div className="space-y-8">
              <div className="backdrop-blur-md bg-black/30 rounded-xl shadow-lg p-6 border-t-4 border-primary">
                <PomodoroTimer />
              </div>

              <div className="backdrop-blur-md bg-black/30 rounded-xl shadow-lg border-t-4 border-primary">
                <TaskList />
              </div>
              
              <div className="backdrop-blur-md bg-black/30 rounded-xl shadow-lg border-t-4 border-primary">
                <Calendar />
              </div>
            </div>

            {/* Right Column - Music Player & Quick Notes */}
            <div className="space-y-8">
              <div className="backdrop-blur-md bg-black/30 rounded-xl shadow-lg border-t-4 border-primary h-fit">
                <MusicPlayer />
              </div>
              
              <div className="backdrop-blur-md bg-black/30 rounded-xl shadow-lg border-t-4 border-primary">
                <QuickNotes />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sounds' && (
          <div className="backdrop-blur-md bg-black/30 rounded-xl shadow-lg p-6 border-t-4 border-primary">
            <AmbientSounds />
          </div>
        )}

        {activeTab === 'breathing' && (
          <div className="backdrop-blur-md bg-black/30 rounded-xl shadow-lg p-6 border-t-4 border-primary">
            <BreathingExercise />
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="backdrop-blur-md bg-black/30 rounded-xl shadow-lg p-6 border-t-4 border-primary">
            <GoalSetting />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="backdrop-blur-md bg-black/30 rounded-xl shadow-lg p-6 border-t-4 border-primary">
            <FocusAnalytics />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;