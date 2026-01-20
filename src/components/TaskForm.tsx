import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Task } from '../lib/supabase';

interface TaskFormProps {
  onAdd: (title: string, description: string, priority: Task['priority']) => Promise<void>;
}

export default function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    await onAdd(title, description, priority);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setLoading(false);
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-md hover:shadow-lg"
      >
        <Plus className="w-5 h-5" />
        Add New Task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Task</h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="What needs to be done?"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            placeholder="Add more details (optional)"
            rows={3}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Task['priority'])}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={loading}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Task'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setTitle('');
              setDescription('');
              setPriority('medium');
            }}
            disabled={loading}
            className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
