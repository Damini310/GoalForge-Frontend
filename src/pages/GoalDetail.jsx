import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function GoalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dark, setDark } = useTheme();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMilestone, setNewMilestone] = useState('');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const fetchGoal = async () => {
    try {
      const res = await api.get(`/api/goals/${id}`);
      setGoal(res.data);
      setEditData({
        title: res.data.title,
        description: res.data.description,
        category: res.data.category,
        status: res.data.status,
        targetDate: res.data.targetDate,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoal(); }, [id]);

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestone.trim()) return;
    await api.post(`/api/goals/${id}/milestones`, { title: newMilestone });
    setNewMilestone('');
    fetchGoal();
  };

  const handleToggleMilestone = async (milestone) => {
    await api.put(`/api/goals/${id}/milestones/${milestone.id}`, {
      title: milestone.title,
      completed: !milestone.completed,
    });
    fetchGoal();
  };

  const handleDeleteMilestone = async (mId) => {
    await api.delete(`/api/goals/${id}/milestones/${mId}`);
    fetchGoal();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await api.put(`/api/goals/${id}`, editData);
    setEditing(false);
    fetchGoal();
  };

  const statusColor = (status) => {
    if (status === 'COMPLETED') return 'bg-green-100 text-green-700';
    if (status === 'ABANDONED') return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700';
  };

  const card = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' };
  const input = { backgroundColor: 'var(--bg-input)', border: '2px solid var(--border-input)', color: 'var(--text)' };

  if (loading) return (
    <div style={{ backgroundColor: 'var(--bg)' }} className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  );

  if (!goal) return (
    <div style={{ backgroundColor: 'var(--bg)' }} className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Goal not found.</p>
    </div>
  );

  const completed = goal.milestones?.filter(m => m.completed).length || 0;
  const total = goal.milestones?.length || 0;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>

      {/* Navbar */}
      <nav style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
        className="px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <h1 className="text-xl font-bold text-purple-600">GoalForge</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setDark(!dark)} className="text-xl hover:scale-110 transition">
            {dark ? '☀️' : '🌙'}
          </button>
          <button onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-400 hover:text-purple-600 transition">
            ← Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Goal Header */}
        {!editing ? (
          <div style={card} className="p-6 rounded-2xl shadow-sm mb-6">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{goal.title}</h2>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(goal.status)}`}>
                {goal.status.replace('_', ' ')}
              </span>
            </div>
            {goal.description && (
              <p className="text-gray-400 mb-4">{goal.description}</p>
            )}
            <div className="text-sm text-gray-400 space-y-1">
              {goal.category && <p>📁 Category: {goal.category}</p>}
              {goal.targetDate && <p>📅 Target Date: {goal.targetDate}</p>}
            </div>
            <button onClick={() => setEditing(true)}
              className="mt-4 text-sm bg-purple-50 text-purple-600 px-4 py-2 rounded-xl hover:bg-purple-100 transition">
              Edit Goal
            </button>
          </div>
        ) : (
          <div style={card} className="p-6 rounded-2xl shadow-sm mb-6">
            <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--text)' }}>Edit Goal</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input type="text" value={editData.title}
                onChange={e => setEditData({ ...editData, title: e.target.value })}
                style={input} className="w-full rounded-xl px-4 py-3 focus:outline-none" required />
              <textarea value={editData.description}
                onChange={e => setEditData({ ...editData, description: e.target.value })}
                style={input} className="w-full rounded-xl px-4 py-3 focus:outline-none resize-none" rows={3} />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Category" value={editData.category}
                  onChange={e => setEditData({ ...editData, category: e.target.value })}
                  style={input} className="rounded-xl px-4 py-3 focus:outline-none" />
                <input type="date" value={editData.targetDate}
                  onChange={e => setEditData({ ...editData, targetDate: e.target.value })}
                  style={input} className="rounded-xl px-4 py-3 focus:outline-none" />
              </div>
              <select value={editData.status}
                onChange={e => setEditData({ ...editData, status: e.target.value })}
                style={input} className="w-full rounded-xl px-4 py-3 focus:outline-none">
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="ABANDONED">Abandoned</option>
              </select>
              <div className="flex gap-2">
                <button type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-xl font-semibold">
                  Save Changes
                </button>
                <button type="button" onClick={() => setEditing(false)}
                  className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Progress Bar */}
        <div style={card} className="p-6 rounded-2xl shadow-sm mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Milestone Progress</span>
            <span>{completed}/{total} completed</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }} />
          </div>
          <p className="text-right text-xs text-gray-400 mt-1">{progress}%</p>
        </div>

        {/* Milestones */}
        <div style={card} className="p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--text)' }}>Milestones</h3>

          <form onSubmit={handleAddMilestone} className="flex gap-2 mb-4">
            <input type="text" placeholder="Add a milestone..." value={newMilestone}
              onChange={e => setNewMilestone(e.target.value)}
              style={input} className="flex-1 rounded-xl px-4 py-2 focus:outline-none text-sm" />
            <button type="submit"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:from-purple-700 hover:to-indigo-700 transition">
              Add
            </button>
          </form>

          {goal.milestones?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No milestones yet. Add one above!</p>
          ) : (
            <ul className="space-y-2">
              {goal.milestones?.map(milestone => (
                <li key={milestone.id}
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}
                  className="flex items-center justify-between p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={milestone.completed}
                      onChange={() => handleToggleMilestone(milestone)}
                      className="accent-purple-600 w-4 h-4 cursor-pointer" />
                    <span className={`text-sm ${milestone.completed ? 'line-through text-gray-400' : ''}`}
                      style={{ color: milestone.completed ? undefined : 'var(--text)' }}>
                      {milestone.title}
                    </span>
                  </div>
                  <button onClick={() => handleDeleteMilestone(milestone.id)}
                    className="text-red-400 hover:text-red-600 text-xs transition">
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}