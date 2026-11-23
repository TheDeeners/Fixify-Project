import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Category } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

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
        <h1 className="text-2xl font-bold text-text tracking-tight">จัดการหมวดหมู่งานซ่อม</h1>
        <p className="text-sm text-text-muted mt-1">
          ประเภทของงานซ่อมบำรุง เช่น ระบบไฟฟ้า, ประปา, ปรับอากาศ
        </p>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border p-5 sm:p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
          เพิ่มหมวดหมู่ใหม่
        </h3>
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="ชื่อหมวดหมู่ เช่น งานโครงสร้างและสี"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3.5 py-2 text-sm border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-primary-hover text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่ม</span>
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-text-muted">กำลังโหลดหมวดหมู่...</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden divide-y divide-border">
          {categories.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between hover:bg-background/40 transition-colors">
              <div>
                <h4 className="font-semibold text-text text-sm">{c.name}</h4>
                <p className="text-xs text-text-muted mt-0.5">
                  จำนวนใบแจ้งซ่อม: {c._count?.requests || 0} รายการ
                </p>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-text-muted hover:text-rose-700 p-1.5 rounded transition-colors"
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
