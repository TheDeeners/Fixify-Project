import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Asset, Location } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

export const AdminAssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [assetCode, setAssetCode] = useState('');
  const [locationId, setLocationId] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsRes, locRes] = await Promise.all([
        api.get('/assets'),
        api.get('/locations'),
      ]);
      setAssets(assetsRes.data.data);
      setLocations(locRes.data.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/assets', { name, assetCode, locationId });
      setShowModal(false);
      setName('');
      setAssetCode('');
      setLocationId('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถสร้างอุปกรณ์ได้');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันลบอุปกรณ์นี้?')) return;
    try {
      await api.delete(`/assets/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถลบอุปกรณ์ได้');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">จัดการอุปกรณ์และทรัพย์สิน (Assets)</h1>
          <p className="text-sm text-text-muted mt-1">ขึ้นทะเบียนรหัสทรัพย์สินและผูกกับสถานที่ตั้ง</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium px-4 py-2.5 rounded-lg text-xs shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มอุปกรณ์</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-text-muted">กำลังโหลดอุปกรณ์...</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-background text-text-muted border-b border-border uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">รหัสทรัพย์สิน (Asset Code)</th>
                <th className="p-4">ชื่ออุปกรณ์</th>
                <th className="p-4">สถานที่ติดตั้ง</th>
                <th className="p-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text">
              {assets.map((a) => (
                <tr key={a.id} className="hover:bg-background/40 transition-colors">
                  <td className="p-4 font-mono font-semibold text-secondary">{a.assetCode}</td>
                  <td className="p-4 font-semibold text-text">{a.name}</td>
                  <td className="p-4 text-text-muted">{a.location?.name}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="text-xs text-rose-700 hover:bg-rose-50 p-1.5 rounded transition-colors"
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

      {showModal && (
        <div className="fixed inset-0 bg-text/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
            <h3 className="text-base font-bold text-text">เพิ่มอุปกรณ์/ทรัพย์สินใหม่</h3>
            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">ชื่ออุปกรณ์</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น เครื่องปรับอากาศส่วนกลาง อาคาร 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">รหัสทรัพย์สิน</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น AC-B1-MAIN"
                  value={assetCode}
                  onChange={(e) => setAssetCode(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text font-mono focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">สถานที่ตั้ง</label>
                <select
                  required
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                >
                  <option value="">-- เลือกสถานที่ --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

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
