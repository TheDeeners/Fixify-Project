import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Category, Location, Asset, Priority } from '../../types';
import { ArrowLeft, Send, Upload } from 'lucide-react';

export const CreateRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [assetId, setAssetId] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          api.get('/categories'),
          api.get('/locations'),
        ]);
        setCategories(catRes.data.data);
        setLocations(locRes.data.data);
      } catch {
        setError('ไม่สามารถโหลดข้อมูลหมวดหมู่หรือสถานที่ได้');
      }
    };
    fetchMasterData();
  }, []);

  // เมื่อเลือกสถานที่ ให้โหลดทรัพย์สินของสถานที่นั้น
  useEffect(() => {
    if (locationId) {
      api.get(`/assets?locationId=${locationId}`).then((res) => {
        setAssets(res.data.data);
      });
    } else {
      setAssets([]);
      setAssetId('');
    }
  }, [locationId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 5) {
        alert('อัปโหลดรูปภาพได้สูงสุด 5 รูป');
        return;
      }
      setSelectedFiles(files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. สร้าง Request
      const res = await api.post('/requests', {
        title,
        description,
        categoryId,
        locationId,
        assetId: assetId || null,
        priority,
      });

      const newRequest = res.data.data;

      // 2. แนบรูปถ่ายก่อนซ่อม (ถ้ามี)
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append('images', file));
        formData.append('stage', 'BEFORE');
        await api.post(`/requests/${newRequest.id}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      navigate(`/requests/${newRequest.id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างใบแจ้งซ่อม'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-primary">สร้างใบแจ้งซ่อมใหม่</h1>
          <p className="text-sm text-secondary">กรอกรายละเอียดเพื่อส่งเรื่องให้หัวหน้าอาคารดูแล</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            หัวข้องานซ่อม <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น แอร์ไม่เย็น, หลอดไฟกะพริบ, ก๊อกน้ำรั่ว"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              หมวดหมู่งานซ่อม <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm text-secondary"
            >
              <option value="">-- เลือกหมวดหมู่ --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              ระดับความเร่งด่วน <span className="text-red-500">*</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm text-secondary"
            >
              <option value="LOW">ต่ำ</option>
              <option value="MEDIUM">ปานกลาง</option>
              <option value="HIGH">สูง</option>
              <option value="URGENT">เร่งด่วนที่สุด</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              สถานที่ / ห้อง / จุดที่เกิดเหตุ <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm text-secondary"
            >
              <option value="">-- เลือกสถานที่ --</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              อุปกรณ์ / ทรัพย์สิน (ถ้ามี)
            </label>
            <select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              disabled={!locationId || assets.length === 0}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm text-secondary disabled:bg-slate-100"
            >
              <option value="">-- ไม่ระบุ / ไม่มีในรายการ --</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.assetCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            รายละเอียดปัญหา <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="อธิบายอาการของปัญหาและจุดสังเกตเพิ่มเติมอย่างละเอียด..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            แนบรูปภาพก่อนซ่อม (สูงสุด 5 รูป)
          </label>
          <div className="mt-1 flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>เลือกรูปภาพ</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <span className="text-xs text-slate-500">
              {selectedFiles.length > 0
                ? `เลือกแล้ว ${selectedFiles.length} ไฟล์`
                : 'รองรับไฟล์ JPG, PNG, WEBP ไม่เกิน 5MB'}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary font-semibold px-5 py-2.5 rounded-lg text-sm shadow-sm transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'กำลังส่งข้อมูล...' : 'ส่งใบแจ้งซ่อม'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
