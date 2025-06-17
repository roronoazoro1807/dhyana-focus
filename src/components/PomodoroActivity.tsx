import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface FocusDay {
  date: string; // ISO date string (YYYY-MM-DD)
  count: number; // Number of completed focus sessions
}

export function PomodoroActivity() {
  const [focusData, setFocusData] = useState<FocusDay[]>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  
  // Load focus data from localStorage on component mount
  useEffect(() => {
    const savedFocusData = localStorage.getItem('focus-sessions');
    if (savedFocusData) {
      try {
        const parsedData = JSON.parse(savedFocusData);
        setFocusData(parsedData);
      } catch (error) {
        console.error('Failed to parse saved focus data:', error);
      }
    } else {
      // Generate some mock data for demonstration
      generateMockData();
    }
  }, []);

  // Generate mock data for demonstration purposes
  const generateMockData = () => {
    const mockData: FocusDay[] = [];
    const today = new Date();
    
    // Generate data for the last 90 days
    for (let i = 0; i < 90; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Random count between 0 and 5
      const count = Math.floor(Math.random() * 6);
      
      if (count > 0) {
        mockData.push({
          date: date.toISOString().split('T')[0],
          count
        });
      }
    }
    
    setFocusData(mockData);
    localStorage.setItem('focus-sessions', JSON.stringify(mockData));
  };

  // Navigate to previous month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Get the number of days in the current month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get the day of the week for the first day of the month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Get the focus count for a specific date
  const getFocusCount = (dateStr: string) => {
    const day = focusData.find(d => d.date === dateStr);
    return day ? day.count : 0;
  };

  // Get color based on focus count
  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-gray-800';
    if (count === 1) return 'bg-primary/20';
    if (count === 2) return 'bg-primary/40';
    if (count === 3) return 'bg-primary/60';
    if (count === 4) return 'bg-primary/80';
    return 'bg-primary';
  };

  // Get month name
  const getMonthName = (month: number) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month];
  };

  // Render the calendar grid
  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-5 h-5 rounded-sm bg-transparent"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      const count = getFocusCount(dateStr);
      
      days.push(
        <div 
          key={dateStr} 
          className={`w-5 h-5 rounded-sm ${getColorClass(count)} cursor-pointer transition-colors`}
          title={`${dateStr}: ${count} focus sessions`}
        ></div>
      );
    }
    
    return days;
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold">
          <span className="block">ध्यान गतिविधि</span>
          <span className="block text-lg text-primary">Focus Activity</span>
        </h2>
      </div>

      <div className="bg-black/40 backdrop-blur-md rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={prevMonth}
            className="p-1 rounded-full hover:bg-black/50"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center">
            <Calendar size={18} className="mr-2 text-primary" />
            <span className="font-medium">
              {getMonthName(currentMonth)} {currentYear}
            </span>
          </div>
          
          <button 
            onClick={nextMonth}
            className="p-1 rounded-full hover:bg-black/50"
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex mb-2">
          <div className="grid grid-cols-7 gap-1 w-full">
            <div className="text-xs text-center text-gray-500">S</div>
            <div className="text-xs text-center text-gray-500">M</div>
            <div className="text-xs text-center text-gray-500">T</div>
            <div className="text-xs text-center text-gray-500">W</div>
            <div className="text-xs text-center text-gray-500">T</div>
            <div className="text-xs text-center text-gray-500">F</div>
            <div className="text-xs text-center text-gray-500">S</div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {renderCalendarGrid()}
        </div>

        <div className="flex items-center justify-center mt-4 text-xs text-gray-400">
          <div className="flex items-center space-x-1 mr-4">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-gray-800"></div>
            <div className="w-3 h-3 rounded-sm bg-primary/20"></div>
            <div className="w-3 h-3 rounded-sm bg-primary/40"></div>
            <div className="w-3 h-3 rounded-sm bg-primary/60"></div>
            <div className="w-3 h-3 rounded-sm bg-primary/80"></div>
            <div className="w-3 h-3 rounded-sm bg-primary"></div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
} 