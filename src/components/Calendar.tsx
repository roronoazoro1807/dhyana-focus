import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface CalendarEvent {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  title: string;
  description?: string;
  color?: string;
}

export function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  
  // Load events from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar-events');
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (error) {
        console.error('Failed to parse saved events:', error);
      }
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);

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

  // Get events for a specific date
  const getEventsForDate = (dateStr: string) => {
    return events.filter(event => event.date === dateStr);
  };

  // Check if a date has events
  const hasEvents = (dateStr: string) => {
    return events.some(event => event.date === dateStr);
  };

  // Get month name
  const getMonthName = (month: number) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month];
  };

  // Add a new event
  const addEvent = () => {
    if (!selectedDate || !newEventTitle.trim()) return;
    
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      date: selectedDate,
      title: newEventTitle.trim(),
      description: newEventDescription.trim() || undefined,
      color: getRandomColor()
    };
    
    setEvents([...events, newEvent]);
    setNewEventTitle('');
    setNewEventDescription('');
    setIsDialogOpen(false);
  };

  // Delete an event
  const deleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
  };

  // Get a random color for the event
  const getRandomColor = () => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-red-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-teal-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Render the calendar grid
  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 border border-gray-800 bg-black/30"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // Create date with correct timezone handling
      const date = new Date(Date.UTC(currentYear, currentMonth, day));
      const dateStr = date.toISOString().split('T')[0];
      
      // Check if this is today
      const today = new Date();
      const isToday = day === today.getDate() && 
                      currentMonth === today.getMonth() && 
                      currentYear === today.getFullYear();
      
      const dayEvents = getEventsForDate(dateStr);
      
      days.push(
        <div 
          key={dateStr} 
          className={`h-12 border border-gray-800 relative ${
            isToday ? 'bg-primary/20 ring-2 ring-primary' : 'bg-black/30'
          } hover:bg-black/50 cursor-pointer transition-colors`}
          onClick={() => {
            setSelectedDate(dateStr);
            setIsDialogOpen(true);
          }}
        >
          <div className={`absolute top-1 left-1 text-sm ${isToday ? 'font-bold text-primary' : ''}`}>
            {day}
          </div>
          {hasEvents(dateStr) && (
            <div className="absolute bottom-1 right-1 flex space-x-1">
              {dayEvents.slice(0, 3).map(event => (
                <div 
                  key={event.id} 
                  className={`w-2 h-2 rounded-full ${event.color || 'bg-primary'}`}
                  title={event.title}
                ></div>
              ))}
              {dayEvents.length > 3 && (
                <div className="w-2 h-2 rounded-full bg-gray-400" title={`${dayEvents.length - 3} more events`}></div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    // Parse the ISO date string correctly
    const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
    const date = new Date(year, month - 1, day); // month is 0-indexed in JS Date
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold">
          <span className="block">कैलेंडर</span>
          <span className="block text-lg text-primary">Calendar</span>
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
            <CalendarIcon size={18} className="mr-2 text-primary" />
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

        <div className="grid grid-cols-7 gap-0 mb-1">
          <div className="text-center text-gray-500 py-1">Sun</div>
          <div className="text-center text-gray-500 py-1">Mon</div>
          <div className="text-center text-gray-500 py-1">Tue</div>
          <div className="text-center text-gray-500 py-1">Wed</div>
          <div className="text-center text-gray-500 py-1">Thu</div>
          <div className="text-center text-gray-500 py-1">Fri</div>
          <div className="text-center text-gray-500 py-1">Sat</div>
        </div>

        <div className="grid grid-cols-7 gap-0">
          {renderCalendarGrid()}
        </div>

        <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 border border-primary/30 rounded-lg p-6 w-[90vw] max-w-md shadow-[0_0_15px_rgba(var(--primary),0.3)] z-50">
              <Dialog.Title className="text-xl font-semibold mb-4 text-primary">
                {selectedDate ? formatDate(selectedDate) : 'Add Event'}
              </Dialog.Title>
              
              {selectedDate && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="event-title" className="block text-sm font-medium mb-1 text-gray-300">
                      Event Title
                    </label>
                    <input
                      id="event-title"
                      type="text"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      placeholder="Enter event title"
                      className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-black/50 text-gray-200 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="event-description" className="block text-sm font-medium mb-1 text-gray-300">
                      Description (Optional)
                    </label>
                    <textarea
                      id="event-description"
                      value={newEventDescription}
                      onChange={(e) => setNewEventDescription(e.target.value)}
                      placeholder="Enter event description"
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-black/50 text-gray-200 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                  </div>
                  
                  {getEventsForDate(selectedDate).length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-2">Events on this day:</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {getEventsForDate(selectedDate).map(event => (
                          <div 
                            key={event.id} 
                            className="p-2 rounded-lg bg-black/50 border border-gray-700 flex justify-between items-center"
                          >
                            <div>
                              <div className="font-medium text-gray-200">{event.title}</div>
                              {event.description && (
                                <div className="text-sm text-gray-400">{event.description}</div>
                              )}
                            </div>
                            <button
                              onClick={() => deleteEvent(event.id)}
                              className="p-1 rounded text-gray-400 hover:text-red-500"
                              aria-label="Delete event"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Dialog.Close asChild>
                      <button className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700">
                        Cancel
                      </button>
                    </Dialog.Close>
                    <button
                      onClick={addEvent}
                      disabled={!newEventTitle.trim()}
                      className="px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} className="inline mr-1" />
                      Add Event
                    </button>
                  </div>
                </div>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
} 