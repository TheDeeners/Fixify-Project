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
    <div className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text tracking-tight">
            {user?.role === 'REQUESTER' ? 'รายการแจ้งซ่อมของฉัน' : 'รายการใบแจ้งซ่อมทั้งหมด'}
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            ติดตามสถานะและตรวจสอบรายละเอียดความคืบหน้างานซ่อม
          </p>
        </div>

        {user?.role === 'REQUESTER' && (
          <Link
            to="/requests/new"
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white font-medium px-3.5 py-2 rounded-lg shadow-2xs transition-colors text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>สร้างใบแจ้งซ่อม</span>
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface p-3.5 rounded-xl shadow-2xs border border-border">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-5 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-text-muted" />
            <input
              type="text"
              placeholder="ค้นหาตามเลขที่ใบ, หัวข้อ หรือรายละเอียด..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all"
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
              className="w-full py-1.5 px-2.5 text-xs border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all"
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
              className="w-full py-1.5 px-3 text-xs bg-primary hover:bg-primary-hover text-white rounded-lg flex items-center justify-center gap-1 transition-colors font-medium shadow-2xs"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>ค้นหา</span>
            </button>
          </div>
        </form>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-14 bg-surface rounded-xl border border-border">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-text-muted">กำลังโหลดข้อมูลใบแจ้งซ่อม...</p>
        </div>
      ) : error ? (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
          {error}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-14 bg-surface rounded-xl border border-border">
          <p className="text-sm font-semibold text-text">ไม่พบรายการแจ้งซ่อม</p>
          <p className="text-xs text-text-muted mt-0.5">ยังไม่มีข้อมูลตามเงื่อนไขที่คุณเลือก</p>
          {user?.role === 'REQUESTER' && (
            <Link
              to="/requests/new"
              className="mt-3 inline-flex items-center gap-1.5 bg-primary text-white font-medium px-3.5 py-1.5 rounded-lg text-xs shadow-2xs"
            >
              สร้างใบแจ้งซ่อมใหม่
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-surface rounded-xl shadow-2xs border border-border overflow-hidden divide-y divide-border">
          {requests.map((req) => (
            <Link
              key={req.id}
              to={`/requests/${req.id}`}
              className="block p-3.5 sm:p-4 hover:bg-background/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-secondary">
                      {req.requestNo}
                    </span>
                    <StatusBadge status={req.status as RequestStatus} />
                    <PriorityBadge priority={req.priority as Priority} />
                    <span className="text-[10px] text-text-muted bg-background px-1.5 py-0.5 rounded border border-border">
                      {req.category?.name}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-text">{req.title}</h3>
                  <p className="text-xs text-text-muted line-clamp-1">{req.description}</p>

                  <div className="flex items-center gap-3 text-[11px] text-text-muted pt-0.5">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-text-light" />
                      <span>{req.location?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-text-light" />
                      <span>{new Date(req.createdAt).toLocaleDateString('th-TH')}</span>
                    </div>
                    {req.technician && (
                      <span className="hidden sm:inline text-secondary font-medium">
                        ช่าง: {req.technician.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="self-end sm:self-center flex items-center text-text-light hover:text-primary">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-1">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 text-xs font-medium bg-surface border border-border text-text rounded-md disabled:opacity-40 hover:bg-background transition-colors"
          >
            ก่อนหน้า
          </button>
          <span className="text-xs text-text-muted">
            หน้า {page} จาก {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 text-xs font-medium bg-surface border border-border text-text rounded-md disabled:opacity-40 hover:bg-background transition-colors"
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
};
