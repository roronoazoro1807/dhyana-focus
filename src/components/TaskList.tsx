import { useState, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { Check, Plus, Trash2, Clock, AlertTriangle, BarChart2 } from 'lucide-react';
import { cn } from '../lib/utils';
import * as Dialog from '@radix-ui/react-dialog';

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

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTask, setNewTask] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTaskDetails, setNewTaskDetails] = useState({
    text: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    difficulty: 3 as 1 | 2 | 3 | 4 | 5,
    estimatedMinutes: 25
  });
  const [sortBy, setSortBy] = useState<'priority' | 'difficulty' | 'time' | 'created'>('priority');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTaskDetails.text.trim()) {
      setTasks([...tasks, { 
        id: Date.now().toString(), 
        text: newTaskDetails.text, 
        completed: false,
        priority: newTaskDetails.priority,
        difficulty: newTaskDetails.difficulty,
        estimatedMinutes: newTaskDetails.estimatedMinutes,
        dateCreated: new Date()
      }]);
      setNewTaskDetails({
        text: '',
        priority: 'medium',
        difficulty: 3,
        estimatedMinutes: 25
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (newTask.trim()) {
        setTasks([...tasks, { 
          id: Date.now().toString(), 
          text: newTask, 
          completed: false,
          priority: 'medium',
          difficulty: 3,
          estimatedMinutes: 25,
          dateCreated: new Date()
        }]);
        setNewTask('');
      }
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id 
        ? { 
            ...t, 
            completed: !t.completed,
            dateCompleted: !t.completed ? new Date() : undefined
          } 
        : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return '';
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return '⭐'.repeat(difficulty);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    
    switch (sortBy) {
      case 'priority':
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'difficulty':
        return b.difficulty - a.difficulty;
      case 'time':
        return a.estimatedMinutes - b.estimatedMinutes;
      case 'created':
        return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        <span className="block">कार्य सूची</span>
        <span className="block text-lg text-primary">Task List</span>
      </h2>
      
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Quick add task..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-700 bg-black/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
        />
        <Dialog.Root open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <Dialog.Trigger asChild>
            <button
              className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-black transition-all"
              aria-label="Add detailed task"
            >
              <Plus size={24} />
            </button>
          </Dialog.Trigger>
          
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 border border-primary/30 rounded-lg p-6 w-[90vw] max-w-md shadow-[0_0_15px_rgba(var(--primary),0.3)] z-50">
              <Dialog.Title className="text-xl font-semibold mb-4 text-primary">Add Task</Dialog.Title>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Task Description
                  </label>
                  <input
                    type="text"
                    value={newTaskDetails.text}
                    onChange={(e) => setNewTaskDetails({...newTaskDetails, text: e.target.value})}
                    placeholder="What needs to be done?"
                    className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-black/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-gray-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Priority
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewTaskDetails({...newTaskDetails, priority: 'low'})}
                      className={`flex-1 py-2 rounded-lg border ${newTaskDetails.priority === 'low' ? 'bg-green-500/20 border-green-500 text-green-500' : 'border-gray-700 text-gray-400'}`}
                    >
                      Low
                    </button>
                    <button
                      onClick={() => setNewTaskDetails({...newTaskDetails, priority: 'medium'})}
                      className={`flex-1 py-2 rounded-lg border ${newTaskDetails.priority === 'medium' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'border-gray-700 text-gray-400'}`}
                    >
                      Medium
                    </button>
                    <button
                      onClick={() => setNewTaskDetails({...newTaskDetails, priority: 'high'})}
                      className={`flex-1 py-2 rounded-lg border ${newTaskDetails.priority === 'high' ? 'bg-red-500/20 border-red-500 text-red-500' : 'border-gray-700 text-gray-400'}`}
                    >
                      High
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Difficulty (1-5)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(level => (
                      <button
                        key={level}
                        onClick={() => setNewTaskDetails({...newTaskDetails, difficulty: level as 1 | 2 | 3 | 4 | 5})}
                        className={`flex-1 py-2 rounded-lg border ${newTaskDetails.difficulty === level ? 'bg-primary/20 border-primary text-primary' : 'border-gray-700 text-gray-400'}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Estimated Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="480"
                    value={newTaskDetails.estimatedMinutes}
                    onChange={(e) => setNewTaskDetails({...newTaskDetails, estimatedMinutes: parseInt(e.target.value) || 25})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-black/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-gray-200"
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Dialog.Close asChild>
                    <button className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700">
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    onClick={addTask}
                    disabled={!newTaskDetails.text.trim()}
                    className="px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-400">Sort by:</div>
        <div className="flex gap-2">
          <button 
            onClick={() => setSortBy('priority')}
            className={`p-1 rounded ${sortBy === 'priority' ? 'bg-primary/20 text-primary' : 'text-gray-500 hover:text-gray-300'}`}
            title="Sort by priority"
          >
            <AlertTriangle size={16} />
          </button>
          <button 
            onClick={() => setSortBy('difficulty')}
            className={`p-1 rounded ${sortBy === 'difficulty' ? 'bg-primary/20 text-primary' : 'text-gray-500 hover:text-gray-300'}`}
            title="Sort by difficulty"
          >
            <BarChart2 size={16} />
          </button>
          <button 
            onClick={() => setSortBy('time')}
            className={`p-1 rounded ${sortBy === 'time' ? 'bg-primary/20 text-primary' : 'text-gray-500 hover:text-gray-300'}`}
            title="Sort by estimated time"
          >
            <Clock size={16} />
          </button>
        </div>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No tasks yet. Add your first task above!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-all",
                task.completed 
                  ? "border-gray-700 bg-black/30 opacity-60" 
                  : "border-gray-700 hover:border-primary"
              )}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "mt-1 w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                  task.completed 
                    ? "bg-green-500/20 border-green-500" 
                    : "border-gray-600 hover:border-primary"
                )}
                aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
              >
                {task.completed && <Check size={12} className="text-green-400" />}
              </button>
              <div className="flex-1">
                <span className={cn(
                  "block",
                  task.completed ? "line-through text-gray-500" : "text-gray-200"
                )}>
                  {task.text}
                </span>
                <div className="flex gap-2 mt-1 text-xs">
                  <span className={getPriorityColor(task.priority)}>
                    {task.priority.toUpperCase()}
                  </span>
                  <span className="text-gray-500">
                    {getDifficultyStars(task.difficulty)}
                  </span>
                  <span className="text-gray-500">
                    <Clock size={10} className="inline mr-1" />
                    {formatTime(task.estimatedMinutes)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-black/50"
                aria-label="Delete task"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}