import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import { LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data.data;
      login(token, user);

      // Redirect ตาม Role
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'MANAGER') {
        navigate('/manager/queue');
      } else if (user.role === 'TECHNICIAN') {
        navigate('/technician/my-tasks');
      } else {
        navigate('/requests');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ ตรวจสอบอีเมลและรหัสผ่าน'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-surface rounded-xl shadow-lg border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-accent rounded-xl mx-auto flex items-center justify-center text-primary font-black text-2xl mb-3">
            F
          </div>
          <h1 className="text-2xl font-bold text-primary">เข้าสู่ระบบ Fixify</h1>
          <p className="text-sm text-secondary mt-1">ระบบบริหารจัดการและแจ้งซ่อมบำรุง</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">อีเมล</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@fixify.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">รหัสผ่าน</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-accent hover:bg-accent-hover text-primary font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-secondary">
          ยังไม่มีบัญชีผู้ใช้งาน?{' '}
          <Link to="/register" className="text-accent font-semibold hover:underline">
            ลงทะเบียนผู้แจ้งซ่อม
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 text-center">
          <p className="font-medium text-slate-700 mb-1">บัญชีทดสอบในระบบ (รหัสผ่าน: password123):</p>
          <p>Admin: admin@fixify.com</p>
          <p>Manager A: manager.a@fixify.com</p>
          <p>Tech A1: tech.a1@fixify.com</p>
          <p>Requester 1: requester1@fixify.com</p>
        </div>
      </div>
    </div>
  );
};
