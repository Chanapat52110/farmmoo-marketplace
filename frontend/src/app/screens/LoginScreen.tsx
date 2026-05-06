import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { login as loginService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    setLoading(true);
    try {
      const { user, access, refresh } = await loginService({ username: username.trim(), password });
      login(user, access, refresh);
      navigate(user.role === 'seller' ? '/dashboard' : '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FFF8F0' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-3xl p-8"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
            <span style={{ fontSize: 44 }}>🐷</span>
          </div>
          <h1 className="text-stone-900" style={{ fontSize: 24, fontWeight: 800 }}>เข้าสู่ระบบ</h1>
          <p className="text-stone-500 mt-1 text-center" style={{ fontSize: 14 }}>
            หมูไทยมาร์เก็ต · สดจากฟาร์มถึงบ้านคุณ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-stone-700 mb-1.5" style={{ fontSize: 14, fontWeight: 600 }}>
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              placeholder="กรอกชื่อผู้ใช้"
              autoComplete="username"
              className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 outline-none focus:border-orange-400 transition-colors text-stone-800"
              style={{ fontSize: 15, fontFamily: 'Sarabun, sans-serif' }}
            />
          </div>

          <div>
            <label className="block text-stone-700 mb-1.5" style={{ fontSize: 14, fontWeight: 600 }}>
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="กรอกรหัสผ่าน"
                autoComplete="current-password"
                className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 pr-12 outline-none focus:border-orange-400 transition-colors text-stone-800"
                style={{ fontSize: 15, fontFamily: 'Sarabun, sans-serif' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-600 rounded-xl px-4 py-2.5"
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white rounded-2xl flex items-center justify-center gap-2 active:bg-orange-600 disabled:opacity-60 transition-colors"
            style={{ height: 54, fontSize: 16, fontWeight: 700, fontFamily: 'Sarabun, sans-serif' }}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <><LogIn size={18} /> เข้าสู่ระบบ</>
            )}
          </button>
        </form>

        <p className="text-center text-stone-500 mt-6" style={{ fontSize: 14 }}>
          ยังไม่มีบัญชี?{' '}
          <Link to="/register" className="text-orange-500 font-bold hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
