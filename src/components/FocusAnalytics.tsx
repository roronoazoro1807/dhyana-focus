import { useState } from 'react';
import { Calendar, Clock, CheckCircle, TrendingUp } from 'lucide-react';

interface FocusSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  completed: boolean;
  taskIds: string[];
}

// Interface for raw session data from localStorage
interface RawFocusSession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  completed: boolean;
  taskIds: string[];
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedMinutes: number;
  dateCreated: Date;
  dateCompleted?: Date;
}

// Interface for raw task data from localStorage
interface RawTask {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedMinutes: number;
  dateCreated: string;
  dateCompleted?: string;
}

export function FocusAnalytics() {
  const [sessions] = useState<FocusSession[]>(() => {
    const saved = localStorage.getItem('focus-sessions');
    if (!saved) return [];
    
    try {
      // Parse the JSON and convert date strings to Date objects
      const parsedSessions = JSON.parse(saved) as RawFocusSession[];
      return parsedSessions.map((session: RawFocusSession) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime)
      }));
    } catch (error) {
      console.error('Error parsing focus sessions:', error);
      return [];
    }
  });
  
  const [tasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    if (!saved) return [];
    
    try {
      // Parse the JSON and convert date strings to Date objects
      const parsedTasks = JSON.parse(saved) as RawTask[];
      return parsedTasks.map((task: RawTask) => ({
        ...task,
        dateCreated: new Date(task.dateCreated),
        dateCompleted: task.dateCompleted ? new Date(task.dateCompleted) : undefined
      }));
    } catch (error) {
      console.error('Error parsing tasks:', error);
      return [];
    }
  });
  
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  
  // Calculate metrics
  const calculateMetrics = () => {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalFocusTime: 0,
        completedTasks: 0,
        averageSessionLength: 0,
        productivityScore: 0
      };
    }
    
    // Filter sessions based on time range
    const now = new Date();
    const filteredSessions = sessions.filter(session => {
      const sessionDate = session.endTime;
      if (timeRange === 'week') {
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        return sessionDate >= oneWeekAgo;
      } else if (timeRange === 'month') {
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return sessionDate >= oneMonthAgo;
      }
      return true; // 'all' time range
    });
    
    const totalSessions = filteredSessions.length;
    const totalFocusTime = filteredSessions.reduce((sum, session) => sum + session.duration, 0);
    
    // Count completed tasks within the time range
    const completedTasks = tasks.filter(task => {
      if (!task.completed || !task.dateCompleted) return false;
      
      const completionDate = task.dateCompleted;
      if (timeRange === 'week') {
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        return completionDate >= oneWeekAgo;
      } else if (timeRange === 'month') {
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return completionDate >= oneMonthAgo;
      }
      return true; // 'all' time range
    }).length;
    
    const averageSessionLength = totalFocusTime / totalSessions;
    
    // Simple productivity score calculation
    const productivityScore = Math.min(100, Math.round((completedTasks / Math.max(1, totalSessions)) * 50 + (totalFocusTime / 60) * 5));
    
    return {
      totalSessions,
      totalFocusTime,
      completedTasks,
      averageSessionLength,
      productivityScore
    };
  };
  
  const metrics = calculateMetrics();
  
  // Format time (minutes) to hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  // Generate daily focus data from actual sessions
  const getDailyFocusData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayData = Array(7).fill(0);
    
    // Get date for the start of the current week (Sunday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Sum up session durations by day of week
    sessions.forEach(session => {
      const sessionDate = new Date(session.endTime);
      
      // Only include sessions from current week
      if (sessionDate >= startOfWeek) {
        const dayOfWeek = sessionDate.getDay();
        dayData[dayOfWeek] += session.duration;
      }
    });
    
    return days.map((day, index) => ({
      day,
      minutes: dayData[index]
    }));
  };
  
  const dailyData = getDailyFocusData();
  const maxMinutes = Math.max(...dailyData.map(d => d.minutes), 1); // Avoid division by zero
  
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        <span className="block">प्रगति विश्लेषण</span>
        <span className="block text-lg text-primary">Focus Analytics</span>
      </h2>
      
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setTimeRange('week')}
          className={`px-3 py-1 rounded-lg ${timeRange === 'week' ? 'bg-primary/20 text-primary' : 'bg-black/30 text-gray-400'}`}
        >
          Week
        </button>
        <button
          onClick={() => setTimeRange('month')}
          className={`px-3 py-1 rounded-lg ${timeRange === 'month' ? 'bg-primary/20 text-primary' : 'bg-black/30 text-gray-400'}`}
        >
          Month
        </button>
        <button
          onClick={() => setTimeRange('all')}
          className={`px-3 py-1 rounded-lg ${timeRange === 'all' ? 'bg-primary/20 text-primary' : 'bg-black/30 text-gray-400'}`}
        >
          All Time
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/30 rounded-lg p-4 flex flex-col items-center">
          <Clock className="text-primary mb-2" size={24} />
          <div className="text-2xl font-bold">{formatTime(metrics.totalFocusTime)}</div>
          <div className="text-xs text-gray-400">Focus Time</div>
        </div>
        
        <div className="bg-black/30 rounded-lg p-4 flex flex-col items-center">
          <CheckCircle className="text-primary mb-2" size={24} />
          <div className="text-2xl font-bold">{metrics.completedTasks}</div>
          <div className="text-xs text-gray-400">Tasks Completed</div>
        </div>
        
        <div className="bg-black/30 rounded-lg p-4 flex flex-col items-center">
          <Calendar className="text-primary mb-2" size={24} />
          <div className="text-2xl font-bold">{metrics.totalSessions}</div>
          <div className="text-xs text-gray-400">Focus Sessions</div>
        </div>
        
        <div className="bg-black/30 rounded-lg p-4 flex flex-col items-center">
          <TrendingUp className="text-primary mb-2" size={24} />
          <div className="text-2xl font-bold">{metrics.productivityScore}</div>
          <div className="text-xs text-gray-400">Productivity Score</div>
        </div>
      </div>
      
      <div className="bg-black/30 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium mb-4 text-center">Daily Focus Time</h3>
        <div className="flex items-end h-40 gap-2">
          {dailyData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-primary/30 rounded-t-sm" 
                style={{ height: `${(data.minutes / maxMinutes) * 100}%` }}
              ></div>
              <div className="text-xs mt-1 text-gray-400">{data.day}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        {sessions.length === 0 ? (
          <p>Track your focus sessions to see more detailed analytics.</p>
        ) : (
          <p>Completed {metrics.totalSessions} focus sessions totaling {formatTime(metrics.totalFocusTime)}.</p>
        )}
      </div>
    </div>
  );
} 