import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { dark, setDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      login(res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 flex-col justify-center items-center text-white p-12">
        <div className="text-6xl mb-6">🎯</div>
        <h1 className="text-5xl font-bold mb-4">GoalForge</h1>
        <p className="text-purple-200 text-xl text-center max-w-sm">
          Forge your goals. Track your milestones. Achieve greatness.
        </p>
        <div className="mt-12 space-y-4 w-full max-w-sm">
          {['Set meaningful goals', 'Track milestones', 'Monitor progress'].map(item => (
            <div key={item} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
              <span className="text-green-300 text-lg">✓</span>
              <span className="text-purple-100">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ backgroundColor: 'var(--bg)' }} className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Dark mode toggle */}
          <div className="flex justify-end mb-4">
            <button onClick={() => setDark(!dark)} className="text-2xl hover:scale-110 transition">
              {dark ? '☀️' : '🌙'}
            </button>
          </div>

          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl">🎯</span>
            <h1 className="text-3xl font-bold text-purple-600 mt-2">GoalForge</h1>
          </div>

          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>Welcome back!</h2>
          <p className="text-gray-400 mb-8">Log in to continue your journey</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ backgroundColor: 'var(--bg-input)', border: '2px solid var(--border-input)', color: 'var(--text)' }}
                className="w-full rounded-xl px-4 py-3 focus:outline-none"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ backgroundColor: 'var(--bg-input)', border: '2px solid var(--border-input)', color: 'var(--text)' }}
                className="w-full rounded-xl px-4 py-3 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg shadow-purple-200 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-600 font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}