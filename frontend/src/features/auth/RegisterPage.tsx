import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';
import { UserPlus } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      return setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
    }

    if (password.length < 8) {
      return setError('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', { name, email, password });
      setSuccess(res.data.message || 'ลงทะเบียนสำเร็จ รอการอนุมัติจากผู้ดูแลระบบ');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
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
          <h1 className="text-2xl font-bold text-text tracking-tight">ลงทะเบียนผู้แจ้งซ่อม</h1>
          <p className="text-sm text-text-muted mt-1">สมัครสมาชิกสำหรับพนักงานเพื่อแจ้งซ่อมอุปกรณ์</p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg">
            {success} กำลังพากลับไปหน้าเข้าสู่ระบบ...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              ชื่อ - นามสกุล
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="สมชาย ใจดี"
              className="w-full px-3.5 py-2.5 text-sm border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              อีเมลองค์กร
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="somchai@company.com"
              className="w-full px-3.5 py-2.5 text-sm border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              รหัสผ่าน (ขั้นต่ำ 8 ตัวอักษร)
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

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              ยืนยันรหัสผ่าน
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-primary hover:bg-primary-hover text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-text-muted">
          มีบัญชีอยู่แล้ว?{' '}
          <Link to="/login" className="text-secondary font-semibold hover:underline">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
};
