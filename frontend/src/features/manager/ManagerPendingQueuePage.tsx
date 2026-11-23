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
        <h1 className="text-2xl font-bold text-primary">คิวรอรับเรื่อง (Pending Queue)</h1>
        <p className="text-sm text-secondary mt-1">
          ใบแจ้งซ่อมใหม่ในอาคารที่คุณดูแล ที่รอการพิจารณารับเรื่องหรือปฏิเสธ
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">กำลังโหลดคิวงาน...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-slate-200">
          <Clock className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-primary">ไม่มีรายการค้างรับเรื่อง</h3>
          <p className="text-sm text-secondary">คุณได้รับเรื่องใบแจ้งซ่อมทั้งหมดเรียบร้อยแล้ว</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-surface rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-accent">
                    {req.requestNo}
                  </span>
                  <PriorityBadge priority={req.priority} />
                </div>
                <Link
                  to={`/requests/${req.id}`}
                  className="text-base font-bold text-primary hover:text-accent transition-colors block"
                >
                  {req.title}
                </Link>
                <p className="text-xs text-secondary line-clamp-2">{req.description}</p>
                <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.location?.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>แจ้งเมื่อ: {new Date(req.createdAt).toLocaleString('th-TH')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">ผู้แจ้ง: </span>
                    <span className="font-medium text-slate-700">{req.requester?.name}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setRejectId(req.id)}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>ปฏิเสธ</span>
                </button>
                <button
                  onClick={() => handleAccept(req.id)}
                  className="px-4 py-1.5 text-xs font-semibold bg-accent hover:bg-accent-hover text-primary rounded-lg flex items-center gap-1 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>รับเรื่อง</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-primary/40 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-primary">ระบุเหตุผลในการปฏิเสธใบแจ้งซ่อม</h3>
            <textarea
              rows={3}
              required
              placeholder="เช่น อยู่นอกเหนือขอบเขตการรับประกัน หรือข้อมูลไม่เพียงพอ..."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-accent"
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejectId(null);
                  setRejectNote('');
                }}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectNote.trim()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
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
