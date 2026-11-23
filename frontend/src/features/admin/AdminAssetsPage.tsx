import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Asset, Location } from '../../types';
import { Box, Plus, Trash2 } from 'lucide-react';

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
          <h1 className="text-2xl font-bold text-primary">จัดการอุปกรณ์และทรัพย์สิน (Assets)</h1>
          <p className="text-sm text-secondary mt-1">ขึ้นทะเบียนรหัสทรัพย์สินและผูกกับสถานที่ตั้ง</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มอุปกรณ์</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">กำลังโหลดอุปกรณ์...</div>
      ) : (
        <div className="bg-surface rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-4">รหัสทรัพย์สิน (Asset Code)</th>
                <th className="p-4">ชื่ออุปกรณ์</th>
                <th className="p-4">สถานที่ติดตั้ง</th>
                <th className="p-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-secondary">
              {assets.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-accent">{a.assetCode}</td>
                  <td className="p-4 font-semibold text-primary">{a.name}</td>
                  <td className="p-4 text-slate-600">{a.location?.name}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="text-xs text-red-600 hover:bg-red-50 p-1.5 rounded"
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
        <div className="fixed inset-0 bg-primary/40 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-primary">เพิ่มอุปกรณ์/ทรัพย์สินใหม่</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">ชื่ออุปกรณ์</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น แอร์ไดกิ้น ห้อง 101"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">รหัสทรัพย์สิน</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น AC-101-01"
                  value={assetCode}
                  onChange={(e) => setAssetCode(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">สถานที่ตั้ง</label>
                <select
                  required
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- เลือกสถานที่ --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
    </div>
  );
};
