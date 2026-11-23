import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { User, Role } from '../../types';
import { UserPlus, Shield } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Create User Form Modal
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('REQUESTER');
  const [managerId, setManagerId] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
      const mgrs = res.data.data.filter((u: User) => u.role === 'MANAGER' && u.isActive);
      setManagers(mgrs);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/users/${id}`, { isActive: !currentStatus });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', {
        name,
        email,
        password,
        role,
        managerId: role === 'TECHNICIAN' ? managerId : null,
        isActive: true,
      });
      setShowModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('REQUESTER');
      setManagerId('');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถสร้างผู้ใช้งานได้');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">จัดการผู้ใช้งานในระบบ</h1>
          <p className="text-sm text-text-muted mt-1">
            อนุมัติผู้สมัครใหม่ กำหนดบทบาท และจัดช่างเข้าทีมหัวหน้า
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium px-4 py-2.5 rounded-lg text-xs shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>เพิ่มผู้ใช้งาน</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-text-muted">กำลังโหลดรายชื่อผู้ใช้...</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-background text-text-muted border-b border-border uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">ชื่อ - นามสกุล</th>
                  <th className="p-4">อีเมล</th>
                  <th className="p-4">บทบาท (Role)</th>
                  <th className="p-4">สังกัดหัวหน้า</th>
                  <th className="p-4">สถานะบัญชี</th>
                  <th className="p-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-background/40 transition-colors">
                    <td className="p-4 font-semibold text-text">{u.name}</td>
                    <td className="p-4 text-text-muted">{u.email}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-medium bg-background text-text border border-border">
                        {u.role === 'ADMIN' && <Shield className="w-3 h-3 text-primary" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-text-muted">
                      {u.manager ? u.manager.name : '-'}
                    </td>
                    <td className="p-4">
                      {u.isActive ? (
                        <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                          ใช้งานได้
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                          รออนุมัติ / ระงับ
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleActive(u.id, u.isActive)}
                        className={`text-xs px-3 py-1 rounded font-medium transition-colors ${
                          u.isActive
                            ? 'bg-surface border border-rose-200 text-rose-700 hover:bg-rose-50'
                            : 'bg-primary text-white hover:bg-primary-hover shadow-sm'
                        }`}
                      >
                        {u.isActive ? 'ระงับการใช้งาน' : 'อนุมัติบัญชี'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-text/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
            <h3 className="text-base font-bold text-text">เพิ่มผู้ใช้งานใหม่</h3>
            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                  ชื่อ - นามสกุล
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                  อีเมล
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                  บทบาท (Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                >
                  <option value="REQUESTER">REQUESTER (ผู้แจ้งซ่อม)</option>
                  <option value="TECHNICIAN">TECHNICIAN (ช่างซ่อม)</option>
                  <option value="MANAGER">MANAGER (หัวหน้าอาคาร)</option>
                  <option value="ADMIN">ADMIN (ผู้ดูแลระบบ)</option>
                </select>
              </div>

              {role === 'TECHNICIAN' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                    สังกัดหัวหน้า (Manager) <span className="text-secondary">*</span>
                  </label>
                  <select
                    required
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  >
                    <option value="">-- เลือกหัวหน้าที่ช่างสังกัด --</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-text-muted hover:text-text transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors shadow-sm"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
