import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Location, User, LocationType } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

export const AdminLocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<LocationType>('BUILDING');
  const [parentId, setParentId] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Assign Manager state
  const [assignLocId, setAssignLocId] = useState<string | null>(null);
  const [selectedMgrId, setSelectedMgrId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [locRes, usersRes] = await Promise.all([
        api.get('/locations'),
        api.get('/users?role=MANAGER'),
      ]);
      setLocations(locRes.data.data);
      setManagers(usersRes.data.data.filter((u: User) => u.isActive));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/locations', {
        name,
        type,
        parentId: parentId || null,
      });
      setShowAddModal(false);
      setName('');
      setType('BUILDING');
      setParentId('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถสร้างสถานที่ได้');
    }
  };

  const handleSetManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignLocId || !selectedMgrId) return;
    try {
      await api.put(`/locations/${assignLocId}/manager`, { managerId: selectedMgrId });
      setAssignLocId(null);
      setSelectedMgrId('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถกำหนดหัวหน้าได้');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันที่จะลบสถานที่นี้?')) return;
    try {
      await api.delete(`/locations/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถลบสถานที่ได้');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">จัดการอาคารและสถานที่</h1>
          <p className="text-sm text-text-muted mt-1">
            กำหนดลำดับชั้นสถานที่ และผูกหัวหน้าผู้ดูแลประจำอาคาร
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium px-4 py-2.5 rounded-lg text-xs shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มสถานที่</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-text-muted">กำลังโหลดข้อมูลสถานที่...</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-background text-text-muted border-b border-border uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-2.5">ชื่อสถานที่</th>
                <th className="px-4 py-2.5">ประเภท</th>
                <th className="px-4 py-2.5">สถานที่หลัก (Parent)</th>
                <th className="px-4 py-2.5">หัวหน้าผู้รับผิดชอบ</th>
                <th className="px-4 py-2.5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text">
              {locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-background/40 transition-colors">
                  <td className="px-4 py-2.5 font-semibold text-text">{loc.name}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-[11px] bg-background text-text px-2 py-0.5 rounded font-mono border border-border">
                      {loc.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-text-muted">{loc.parent ? loc.parent.name : '-'}</td>
                  <td className="px-4 py-2.5">
                    {loc.locationManager?.manager ? (
                      <span className="text-[11px] text-secondary font-medium bg-secondary/5 px-2.5 py-1 rounded-full border border-secondary/20">
                        {loc.locationManager.manager.name}
                      </span>
                    ) : (
                      <span className="text-[11px] text-text-light">ยังไม่กำหนด</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right space-x-2">
                    <button
                      onClick={() => setAssignLocId(loc.id)}
                      className="text-xs bg-surface hover:bg-background text-text border border-border px-2.5 py-1 rounded font-medium transition-colors"
                    >
                      กำหนดหัวหน้า
                    </button>
                    <button
                      onClick={() => handleDelete(loc.id)}
                      className="text-xs text-rose-700 hover:bg-rose-50 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-text/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
            <h3 className="text-base font-bold text-text">เพิ่มสถานที่ใหม่</h3>
            <form onSubmit={handleCreateLocation} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                  ชื่อสถานที่
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น อาคาร 1, อาคารสำนักงานใหญ่"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                  ประเภท
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as LocationType)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                >
                  <option value="BUILDING">BUILDING (อาคาร/ตึก)</option>
                  <option value="FLOOR">FLOOR (ชั้น)</option>
                  <option value="ROOM">ROOM (ห้อง)</option>
                  <option value="AREA">AREA (พื้นที่/บริเวณ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                  สถานที่หลัก (ถ้ามี)
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                >
                  <option value="">-- เป็นระดับบนสุด (เช่น ตึก) --</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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

      {/* Assign Manager Modal */}
      {assignLocId && (
        <div className="fixed inset-0 bg-text/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
            <h3 className="text-base font-bold text-text">กำหนดหัวหน้าผู้ดูแลสถานที่</h3>
            <form onSubmit={handleSetManager} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                  เลือกหัวหน้างาน (Manager)
                </label>
                <select
                  required
                  value={selectedMgrId}
                  onChange={(e) => setSelectedMgrId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                >
                  <option value="">-- เลือกหัวหน้า --</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignLocId(null)}
                  className="px-4 py-2 text-xs font-medium text-text-muted hover:text-text transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!selectedMgrId}
                  className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors shadow-sm"
                >
                  บันทึกหัวหน้าประจำสถานที่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
