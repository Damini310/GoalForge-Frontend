import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function Dashboard() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '', description: '', category: '', status: 'IN_PROGRESS', targetDate: ''
  });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { logout } = useAuth();
  const { dark, setDark } = useTheme();
  const navigate = useNavigate();

  const fetchGoals = async () => {
    try {
      const res = await api.get(`/api/goals?page=${page}&size=6`);
      setGoals(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/goals', newGoal);
      setShowForm(false);
      setNewGoal({ title: '', description: '', category: '', status: 'IN_PROGRESS', targetDate: '' });
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    await api.delete(`/api/goals/${id}`);
    fetchGoals();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statusColor = (status) => {
    if (status === 'COMPLETED') return 'bg-green-100 text-green-700 border border-green-200';
    if (status === 'ABANDONED') return 'bg-red-100 text-red-700 border border-red-200';
    return 'bg-blue-100 text-blue-700 border border-blue-200';
  };

  const categoryEmoji = (category) => {
    const map = {
      Career: '💼', Health: '💪', Finance: '💰',
      Personal: '🌱', Education: '📚', Travel: '✈️'
    };
    return map[category] || '📌';
  };

  const stats = {
    total: goals.length,
    completed: goals.filter(g => g.status === 'COMPLETED').length,
    inProgress: goals.filter(g => g.status === 'IN_PROGRESS').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <h1 className="text-xl font-bold text-purple-600">GoalForge</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setDark(!dark)} className="text-xl hover:scale-110 transition">
            {dark ? '☀️' : '🌙'}
          </button>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-500 transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-gray-400 text-sm">Total Goals</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-gray-400 text-sm">In Progress</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-gray-400 text-sm">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Goals</h2>
            <p className="text-gray-400 text-sm mt-1">Track and manage your goals</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg shadow-purple-200"
          >
            {showForm ? '✕ Cancel' : '+ New Goal'}
          </button>
        </div>

        {/* Create Goal Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-6">
            <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-4">Create New Goal</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Goal title *"
                value={newGoal.title}
                onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                className="w-full border-2 border-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 transition"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={newGoal.description}
                onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                className="w-full border-2 border-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 transition resize-none"
                rows={3}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Category (e.g. Career)"
                  value={newGoal.category}
                  onChange={e => setNewGoal({ ...newGoal, category: e.target.value })}
                  className="border-2 border-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 transition"
                />
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={e => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  className="border-2 border-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 transition"
                />
                <select
                  value={newGoal.status}
                  onChange={e => setNewGoal({ ...newGoal, status: e.target.value })}
                  className="border-2 border-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 transition"
                >
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ABANDONED">Abandoned</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg shadow-purple-200"
              >
                Create Goal →
              </button>
            </form>
          </div>
        )}

        {/* Goals Grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mt-4">Loading your goals...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-6xl mb-4">🎯</p>
            <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-2">No goals yet!</h3>
            <p className="text-gray-400 mb-6">Create your first goal and start your journey.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition"
            >
              + Create First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map(goal => (
              <div key={goal.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{categoryEmoji(goal.category)}</span>
                    <h3 className="font-bold text-gray-800 dark:text-white text-base leading-tight">{goal.title}</h3>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ml-2 ${statusColor(goal.status)}`}>
                    {goal.status.replace('_', ' ')}
                  </span>
                </div>

                {goal.description && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2">{goal.description}</p>
                )}

                {goal.milestones?.length > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{goal.milestones.filter(m => m.completed).length}/{goal.milestones.length}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.round((goal.milestones.filter(m => m.completed).length / goal.milestones.length) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-400 mb-4">
                  {goal.targetDate && <p>📅 Due: {goal.targetDate}</p>}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/goals/${goal.id}`)}
                    className="flex-1 text-sm bg-purple-50 dark:bg-purple-900/30 text-purple-600 py-2 rounded-xl hover:bg-purple-100 transition font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-sm bg-red-50 dark:bg-red-900/20 text-red-400 px-3 py-2 rounded-xl hover:bg-red-100 transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-8">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-5 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition"
            >
              ← Previous
            </button>
            <span className="px-5 py-2 text-sm text-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-5 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}