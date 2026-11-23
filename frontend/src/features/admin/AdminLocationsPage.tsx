import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Location, User, LocationType } from '../../types';
import { Building, Plus, Trash2, UserCheck } from 'lucide-react';

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
          <h1 className="text-2xl font-bold text-primary">จัดการอาคารและสถานที่</h1>
          <p className="text-sm text-secondary mt-1">
            กำหนดลำดับชั้นสถานที่ (ตึก/ชั้น/ห้อง) และผูกหัวหน้าประจำอาคาร
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มสถานที่</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">กำลังโหลดข้อมูลสถานที่...</div>
      ) : (
        <div className="bg-surface rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-4">ชื่อสถานที่</th>
                <th className="p-4">ประเภท</th>
                <th className="p-4">สถานที่หลัก (Parent)</th>
                <th className="p-4">หัวหน้าผู้รับผิดชอบ</th>
                <th className="p-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-secondary">
              {locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-primary">{loc.name}</td>
                  <td className="p-4">
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                      {loc.type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{loc.parent ? loc.parent.name : '-'}</td>
                  <td className="p-4">
                    {loc.locationManager?.manager ? (
                      <span className="text-xs text-sky-700 bg-sky-50 px-2 py-1 rounded font-medium">
                        {loc.locationManager.manager.name}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">ยังไม่กำหนด</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setAssignLocId(loc.id)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-primary px-2.5 py-1 rounded font-medium"
                    >
                      กำหนดหัวหน้า
                    </button>
                    <button
                      onClick={() => handleDelete(loc.id)}
                      className="text-xs text-red-600 hover:bg-red-50 p-1 rounded"
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
        <div className="fixed inset-0 bg-primary/40 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-primary">เพิ่มสถานที่ใหม่</h3>
            <form onSubmit={handleCreateLocation} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">ชื่อสถานที่</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น อาคาร A, ชั้น 2, ห้อง 201"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">ประเภท</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as LocationType)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="BUILDING">BUILDING (อาคาร/ตึก)</option>
                  <option value="FLOOR">FLOOR (ชั้น)</option>
                  <option value="ROOM">ROOM (ห้อง)</option>
                  <option value="AREA">AREA (พื้นที่/บริเวณ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">สถานที่หลัก (ถ้ามี)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- เป็นระดับบนสุด (เช่น ตึก) --</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="bg-accent text-primary px-4 py-1.5 rounded-lg font-semibold"
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
        <div className="fixed inset-0 bg-primary/40 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-primary">กำหนดหัวหน้าผู้ดูแลสถานที่</h3>
            <form onSubmit={handleSetManager} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">เลือกหัวหน้างาน (Manager)</label>
                <select
                  required
                  value={selectedMgrId}
                  onChange={(e) => setSelectedMgrId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
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
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!selectedMgrId}
                  className="bg-accent text-primary px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
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
