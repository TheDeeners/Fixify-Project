import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { MaintenanceRequest, RequestStatus, Priority } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { Plus, Search, Filter, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const RequestListPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;
      if (priority) params.priority = priority;

      const res = await api.get('/requests', { params });
      setRequests(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดรายการแจ้งซ่อม');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, status, priority]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {user?.role === 'REQUESTER' ? 'รายการแจ้งซ่อมของฉัน' : 'รายการใบแจ้งซ่อมทั้งหมด'}
          </h1>
          <p className="text-sm text-secondary mt-1">
            ติดตามสถานะและตรวจสอบรายละเอียดความคืบหน้างานซ่อม
          </p>
        </div>

        {user?.role === 'REQUESTER' && (
          <Link
            to="/requests/new"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างใบแจ้งซ่อม</span>
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface p-4 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาตามเลขที่ใบ, หัวข้อ หรือรายละเอียด..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-secondary"
            >
              <option value="">สถานะทั้งหมด</option>
              <option value="PENDING_MANAGER">รอหัวหน้ารับงาน</option>
              <option value="ACCEPTED">หัวหน้ารับเรื่องแล้ว</option>
              <option value="ASSIGNED">มอบหมายช่างแล้ว</option>
              <option value="IN_PROGRESS">กำลังซ่อม</option>
              <option value="WAITING_PARTS">รออะไหล่</option>
              <option value="COMPLETED">ซ่อมเสร็จสิ้น</option>
              <option value="CLOSED">ปิดงานเรียบร้อย</option>
              <option value="REJECTED">ปฏิเสธงาน</option>
              <option value="CANCELLED">ยกเลิกแล้ว</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-secondary"
            >
              <option value="">ความเร่งด่วนทั้งหมด</option>
              <option value="LOW">ต่ำ</option>
              <option value="MEDIUM">ปานกลาง</option>
              <option value="HIGH">สูง</option>
              <option value="URGENT">เร่งด่วนที่สุด</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2 px-4 text-sm bg-secondary hover:bg-primary text-white rounded-lg flex items-center justify-center gap-1.5 transition-colors font-medium"
            >
              <Filter className="w-4 h-4" />
              <span>ค้นหา</span>
            </button>
          </div>
        </form>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-secondary">กำลังโหลดข้อมูลใบแจ้งซ่อม...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-slate-200">
          <p className="text-base font-medium text-slate-700">ไม่พบรายการแจ้งซ่อม</p>
          <p className="text-sm text-secondary mt-1">ยังไม่มีข้อมูลตามเงื่อนไขที่คุณเลือก</p>
          {user?.role === 'REQUESTER' && (
            <Link
              to="/requests/new"
              className="mt-4 inline-flex items-center gap-2 bg-accent text-primary font-semibold px-4 py-2 rounded-lg text-sm"
            >
              สร้างใบแจ้งซ่อมใหม่
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-surface rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {requests.map((req) => (
            <Link
              key={req.id}
              to={`/requests/${req.id}`}
              className="block p-4 sm:p-5 hover:bg-slate-50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-accent">
                      {req.requestNo}
                    </span>
                    <StatusBadge status={req.status as RequestStatus} />
                    <PriorityBadge priority={req.priority as Priority} />
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {req.category?.name}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-primary">{req.title}</h3>
                  <p className="text-sm text-secondary line-clamp-1">{req.description}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.location?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(req.createdAt).toLocaleDateString('th-TH')}</span>
                    </div>
                    {req.technician && (
                      <span className="hidden sm:inline text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        ช่าง: {req.technician.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="self-end sm:self-center flex items-center text-slate-400 hover:text-accent">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm bg-surface border border-slate-300 rounded-lg disabled:opacity-40"
          >
            ก่อนหน้า
          </button>
          <span className="text-sm text-secondary">
            หน้า {page} จาก {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm bg-surface border border-slate-300 rounded-lg disabled:opacity-40"
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
};
