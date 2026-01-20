import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Task } from '../lib/supabase';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import { LogOut, CheckSquare, ListTodo, CheckCircle2, ArrowUpDown } from 'lucide-react';

type TabType = 'todo' | 'completed';
type SortOrder = 'default' | 'priority-high' | 'priority-low';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('todo');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTasks(data);
    }
    setLoading(false);
  };

  const addTask = async (title: string, description: string, priority: Task['priority']) => {
    if (!user) return;

    const { error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title,
      description,
      priority,
      completed: false,
    });

    if (!error) {
      fetchTasks();
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', id);

    if (!error) {
      fetchTasks();
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (!error) {
      fetchTasks();
    }
  };

  const updateTask = async (
    id: string,
    title: string,
    description: string,
    priority: Task['priority']
  ) => {
    const { error } = await supabase
      .from('tasks')
      .update({ title, description, priority })
      .eq('id', id);

    if (!error) {
      fetchTasks();
    }
  };

  const sortTasks = (tasksToSort: Task[]) => {
    const priorityValue = { high: 3, medium: 2, low: 1 };

    switch (sortOrder) {
      case 'priority-high':
        return [...tasksToSort].sort((a, b) => priorityValue[b.priority] - priorityValue[a.priority]);
      case 'priority-low':
        return [...tasksToSort].sort((a, b) => priorityValue[a.priority] - priorityValue[b.priority]);
      default:
        return tasksToSort;
    }
  };

  const filteredTasks = sortTasks(
    tasks.filter((task) => (activeTab === 'todo' ? !task.completed : task.completed))
  );

  const todoCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">TaskFlow</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('todo')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition shadow-md ${
              activeTab === 'todo'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ListTodo className="w-5 h-5" />
            To Do
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-sm ${
                activeTab === 'todo' ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            >
              {todoCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition shadow-md ${
              activeTab === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            Completed
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-sm ${
                activeTab === 'completed' ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            >
              {completedCount}
            </span>
          </button>
        </div>

        {activeTab === 'todo' && (
          <div className="mb-6">
            <TaskForm onAdd={addTask} />
          </div>
        )}

        {filteredTasks.length > 0 && (
          <div className="mb-6 flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-md">
            <div className="flex items-center gap-2 text-gray-700">
              <ArrowUpDown className="w-4 h-4" />
              <span className="font-medium text-sm">Sort by:</span>
            </div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            >
              <option value="default">Default (Newest First)</option>
              <option value="priority-high">Priority: High to Low</option>
              <option value="priority-low">Priority: Low to High</option>
            </select>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              {activeTab === 'todo' ? (
                <ListTodo className="w-16 h-16 mx-auto" />
              ) : (
                <CheckCircle2 className="w-16 h-16 mx-auto" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {activeTab === 'todo' ? 'No tasks yet' : 'No completed tasks'}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'todo'
                ? 'Create your first task to get started'
                : 'Complete tasks to see them here'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onUpdate={updateTask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
