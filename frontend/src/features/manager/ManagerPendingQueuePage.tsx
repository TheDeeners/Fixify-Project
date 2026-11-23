import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { MaintenanceRequest } from '../../types';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { CheckCircle, XCircle, MapPin, Calendar, Clock } from 'lucide-react';

export const ManagerPendingQueuePage: React.FC = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests?status=PENDING_MANAGER');
      setRequests(res.data.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await api.post(`/requests/${id}/accept`);
      fetchQueue();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถรับเรื่องได้');
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectNote.trim()) return;
    try {
      await api.post(`/requests/${rejectId}/reject`, { note: rejectNote });
      setRejectId(null);
      setRejectNote('');
      fetchQueue();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถปฏิเสธเรื่องได้');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text tracking-tight">คิวรอรับเรื่อง (Pending Queue)</h1>
        <p className="text-sm text-text-muted mt-1">
          ใบแจ้งซ่อมใหม่ในอาคารที่คุณดูแล ที่รอการพิจารณารับเรื่องหรือปฏิเสธ
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-text-muted">กำลังโหลดคิวงาน...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <Clock className="w-8 h-8 text-secondary/70 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-text">ไม่มีรายการค้างรับเรื่อง</h3>
          <p className="text-xs text-text-muted mt-0.5">คุณได้รับเรื่องใบแจ้งซ่อมทั้งหมดเรียบร้อยแล้ว</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-surface rounded-xl shadow-sm border border-border p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-secondary">
                    {req.requestNo}
                  </span>
                  <PriorityBadge priority={req.priority} />
                </div>
                <Link
                  to={`/requests/${req.id}`}
                  className="text-base font-semibold text-text hover:text-primary transition-colors block"
                >
                  {req.title}
                </Link>
                <p className="text-xs text-text-muted line-clamp-2">{req.description}</p>
                <div className="text-xs text-text-muted space-y-1 pt-2 border-t border-border">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-text-light" />
                    <span>{req.location?.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-text-light" />
                    <span>แจ้งเมื่อ: {new Date(req.createdAt).toLocaleString('th-TH')}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">ผู้แจ้ง: </span>
                    <span className="font-medium text-text">{req.requester?.name}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  onClick={() => setRejectId(req.id)}
                  className="px-3.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-1 transition-colors border border-transparent hover:border-rose-200"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>ปฏิเสธ</span>
                </button>
                <button
                  onClick={() => handleAccept(req.id)}
                  className="px-4 py-1.5 text-xs font-medium bg-primary hover:bg-primary-hover text-white rounded-lg flex items-center gap-1 transition-colors shadow-sm"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>รับเรื่อง</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-text/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
            <h3 className="text-base font-bold text-text">ระบุเหตุผลในการปฏิเสธใบแจ้งซ่อม</h3>
            <textarea
              rows={3}
              required
              placeholder="เช่น อยู่นอกเหนือขอบเขตการรับประกัน หรือข้อมูลไม่เพียงพอ..."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="w-full text-xs border border-border rounded-lg p-3 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejectId(null);
                  setRejectNote('');
                }}
                className="px-4 py-2 text-xs font-medium text-text-muted hover:text-text transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectNote.trim()}
                className="bg-rose-700 hover:bg-rose-800 text-white px-4 py-2 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors shadow-sm"
              >
                ยืนยันปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
