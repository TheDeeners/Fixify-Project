import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Category } from '../../types';
import { Layers, Plus, Trash2 } from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.post('/categories', { name });
      setName('');
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถสร้างหมวดหมู่ได้');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันลบหมวดหมู่นี้?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถลบหมวดหมู่ได้');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-primary">จัดการหมวดหมู่งานซ่อม</h1>
        <p className="text-sm text-secondary mt-1">
          ประเภทของงานซ่อมบำรุง เช่น ระบบไฟฟ้า, ประปา, ปรับอากาศ
        </p>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-primary mb-3">เพิ่มหมวดหมู่ใหม่</h3>
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="ชื่อหมวดหมู่ เช่น งานโครงสร้างและสี"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            className="bg-accent hover:bg-accent-hover text-primary font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่ม</span>
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12">กำลังโหลดหมวดหมู่...</div>
      ) : (
        <div className="bg-surface rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {categories.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
              <div>
                <h4 className="font-semibold text-primary">{c.name}</h4>
                <p className="text-xs text-slate-400">
                  จำนวนใบแจ้งซ่อม: {c._count?.requests || 0} รายการ
                </p>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-slate-400 hover:text-red-600 p-1.5 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
