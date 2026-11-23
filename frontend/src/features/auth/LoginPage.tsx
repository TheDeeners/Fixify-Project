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
      <div className="max-w-md w-full bg-surface rounded-2xl shadow-sm border border-border p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl mb-3 shadow-sm">
            F
          </div>
          <h1 className="text-2xl font-bold text-text tracking-tight">เข้าสู่ระบบ Fixify</h1>
          <p className="text-sm text-text-muted mt-1">ระบบบริหารจัดการและแจ้งซ่อมบำรุงระดับองค์กร</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              อีเมล
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@fixify.com"
              className="w-full px-3.5 py-2.5 text-sm border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              รหัสผ่าน
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-primary hover:bg-primary-hover text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-text-muted">
          ยังไม่มีบัญชีผู้ใช้งาน?{' '}
          <Link to="/register" className="text-secondary font-semibold hover:underline">
            ลงทะเบียนผู้แจ้งซ่อม
          </Link>
        </div>

        <div className="mt-8 pt-5 border-t border-border text-xs text-text-muted text-center space-y-1">
          <p className="font-medium text-text">บัญชีทดสอบเริ่มต้น (รหัสผ่าน: password123):</p>
          <p className="text-[11px] text-text-muted">Admin: admin@fixify.com</p>
          <p className="text-[11px] text-text-muted">Manager: manager1@fixify.com</p>
          <p className="text-[11px] text-text-muted">Technician: tech.b1.1@fixify.com</p>
          <p className="text-[11px] text-text-muted">Requester: requester1@fixify.com</p>
        </div>
      </div>
    </div>
  );
};
