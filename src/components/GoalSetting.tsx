import { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Check, Calendar, Clock } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Progress from '@radix-ui/react-progress';

interface Goal {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  completed: boolean;
  tasks: GoalTask[];
}

interface GoalTask {
  id: string;
  title: string;
  completed: boolean;
}

export function GoalSetting() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('goals');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    deadline: '',
    tasks: [] as { title: string }[]
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return;
    
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      deadline: newGoal.deadline,
      completed: false,
      tasks: newGoal.tasks.map(task => ({
        id: Date.now() + Math.random().toString(),
        title: task.title,
        completed: false
      }))
    };
    
    setGoals([...goals, goal]);
    setNewGoal({
      title: '',
      description: '',
      deadline: '',
      tasks: []
    });
    setIsDialogOpen(false);
  };

  const handleAddTaskToNewGoal = () => {
    if (!newTaskTitle.trim()) return;
    
    setNewGoal({
      ...newGoal,
      tasks: [...newGoal.tasks, { title: newTaskTitle }]
    });
    setNewTaskTitle('');
  };

  const handleRemoveTaskFromNewGoal = (index: number) => {
    const updatedTasks = [...newGoal.tasks];
    updatedTasks.splice(index, 1);
    setNewGoal({
      ...newGoal,
      tasks: updatedTasks
    });
  };

  const toggleGoalCompletion = (goalId: string) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, completed: !goal.completed } 
        : goal
    ));
  };

  const toggleTaskCompletion = (goalId: string, taskId: string) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? {
            ...goal,
            tasks: goal.tasks.map(task => 
              task.id === taskId 
                ? { ...task, completed: !task.completed } 
                : task
            )
          } 
        : goal
    ));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const getGoalProgress = (goal: Goal) => {
    if (goal.tasks.length === 0) return 0;
    const completedTasks = goal.tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / goal.tasks.length) * 100);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysRemaining = (dateString: string) => {
    if (!dateString) return null;
    
    const deadline = new Date(dateString);
    const today = new Date();
    
    // Reset time part for accurate day calculation
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">
          <span className="block">लक्ष्य निर्धारण</span>
          <span className="block text-lg text-primary">Goal Setting</span>
        </h2>
        
        <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Dialog.Trigger asChild>
            <button className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-black transition-all flex items-center gap-1">
              <Plus size={18} />
              <span>New Goal</span>
            </button>
          </Dialog.Trigger>
          
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 border border-primary/30 rounded-lg p-6 w-[90vw] max-w-md shadow-[0_0_15px_rgba(var(--primary),0.3)] z-50 max-h-[90vh] overflow-y-auto">
              <Dialog.Title className="text-xl font-semibold mb-4 text-primary">
                Create New Goal
              </Dialog.Title>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Goal Title*
                  </label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    placeholder="What do you want to achieve?"
                    className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-black/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-gray-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    placeholder="Describe your goal in detail..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-black/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-gray-200 min-h-[80px]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-black/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-gray-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Tasks
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Add a task for this goal"
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-700 bg-black/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-gray-200"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTaskToNewGoal()}
                    />
                    <button
                      onClick={handleAddTaskToNewGoal}
                      className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-black transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  
                  {newGoal.tasks.length > 0 && (
                    <ul className="space-y-2 mb-4 max-h-[150px] overflow-y-auto">
                      {newGoal.tasks.map((task, index) => (
                        <li key={index} className="flex items-center justify-between p-2 bg-black/30 rounded-lg">
                          <span className="text-gray-300">{task.title}</span>
                          <button
                            onClick={() => handleRemoveTaskFromNewGoal(index)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Dialog.Close asChild>
                    <button className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700">
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    onClick={handleAddGoal}
                    disabled={!newGoal.title.trim()}
                    className="px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Goal
                  </button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-8 bg-black/30 rounded-lg">
          <Target size={48} className="mx-auto mb-4 text-primary/50" />
          <p className="text-gray-400 mb-2">No goals set yet</p>
          <p className="text-gray-500 text-sm">Create your first goal to start tracking progress</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {goals.map((goal) => (
            <div 
              key={goal.id} 
              className={`bg-black/30 rounded-lg border transition-all ${
                goal.completed ? 'border-green-500/50' : 'border-gray-700'
              }`}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className={`text-lg font-medium ${goal.completed ? 'text-green-400' : 'text-primary'}`}>
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-gray-400 text-sm mt-1">{goal.description}</p>
                    )}
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleGoalCompletion(goal.id)}
                      className={`p-1 rounded-full mr-2 ${
                        goal.completed ? 'text-green-400 hover:text-green-300' : 'text-gray-400 hover:text-primary'
                      }`}
                      aria-label={goal.completed ? "Mark as incomplete" : "Mark as complete"}
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1 rounded-full text-gray-400 hover:text-red-500"
                      aria-label="Delete goal"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                {goal.deadline && (
                  <div className="flex items-center text-sm text-gray-400 mb-2">
                    <Calendar size={14} className="mr-1" />
                    <span>{formatDate(goal.deadline)}</span>
                    {getDaysRemaining(goal.deadline) !== null && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        getDaysRemaining(goal.deadline)! < 0 
                          ? 'bg-red-900/30 text-red-400' 
                          : getDaysRemaining(goal.deadline)! <= 3 
                            ? 'bg-yellow-900/30 text-yellow-400' 
                            : 'bg-green-900/30 text-green-400'
                      }`}>
                        <Clock size={10} className="inline mr-1" />
                        {getDaysRemaining(goal.deadline)! < 0 
                          ? `${Math.abs(getDaysRemaining(goal.deadline)!)} days overdue` 
                          : getDaysRemaining(goal.deadline) === 0 
                            ? 'Due today' 
                            : `${getDaysRemaining(goal.deadline)} days left`
                        }
                      </span>
                    )}
                  </div>
                )}
                
                {goal.tasks.length > 0 && (
                  <>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{getGoalProgress(goal)}%</span>
                      </div>
                      <Progress.Root
                        className="relative overflow-hidden bg-gray-800 rounded-full h-2"
                        value={getGoalProgress(goal)}
                      >
                        <Progress.Indicator
                          className="h-full transition-transform duration-300 ease-in-out rounded-full bg-primary"
                          style={{ transform: `translateX(-${100 - getGoalProgress(goal)}%)` }}
                        />
                      </Progress.Root>
                    </div>
                    
                    <div className="mt-3 space-y-1">
                      {goal.tasks.map((task) => (
                        <div 
                          key={task.id} 
                          className="flex items-center p-2 rounded bg-black/20"
                        >
                          <button
                            onClick={() => toggleTaskCompletion(goal.id, task.id)}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 transition-colors ${
                              task.completed 
                                ? 'bg-green-500/20 border-green-500' 
                                : 'border-gray-600 hover:border-primary'
                            }`}
                          >
                            {task.completed && <Check size={12} className="text-green-400" />}
                          </button>
                          <span className={`flex-1 text-sm ${
                            task.completed ? 'line-through text-gray-500' : 'text-gray-300'
                          }`}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 