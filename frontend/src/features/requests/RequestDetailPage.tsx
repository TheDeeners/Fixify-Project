import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { MaintenanceRequest, User, RequestStatus, Priority } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { RequestTimeline } from '../../components/request/RequestTimeline';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Wrench,
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
  Star,
  Plus,
  Upload,
} from 'lucide-react';

export const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals & Inputs
  const [noteModal, setNoteModal] = useState<{
    open: boolean;
    title: string;
    action: string;
    required: boolean;
  }>({ open: false, title: '', action: '', required: false });
  const [noteText, setNoteText] = useState('');

  // Rating state
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');

  // Parts state
  const [partName, setPartName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showPartForm, setShowPartForm] = useState(false);

  // Attachments state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/requests/${id}`);
      setRequest(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลใบแจ้งซ่อมได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    if (user?.role === 'MANAGER') {
      try {
        const res = await api.get('/users/my-technicians');
        setTechnicians(res.data.data);
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    fetchRequest();
    fetchTechnicians();
  }, [id]);

  const handleAction = async (endpoint: string, body?: any) => {
    try {
      setActionLoading(true);
      await api.post(`/requests/${id}/${endpoint}`, body);
      setNoteModal({ open: false, title: '', action: '', required: false });
      setNoteText('');
      fetchRequest();
    } catch (err: any) {
      alert(err.response?.data?.message || 'การดำเนินการไม่สำเร็จ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.post(`/requests/${id}/rating`, { score, comment });
      fetchRequest();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถประเมินได้');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.post(`/requests/${id}/parts`, { partName, quantity });
      setPartName('');
      setQuantity(1);
      setShowPartForm(false);
      fetchRequest();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถบันทึกอะไหล่ได้');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadSubmit = async (stage: 'BEFORE' | 'AFTER') => {
    if (uploadFiles.length === 0) return;
    try {
      setActionLoading(true);
      const formData = new FormData();
      uploadFiles.forEach((file) => formData.append('images', file));
      formData.append('stage', stage);
      await api.post(`/requests/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadFiles([]);
      fetchRequest();
    } catch (err: any) {
      alert(err.response?.data?.message || 'อัปโหลดรูปภาพไม่สำเร็จ');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-secondary">กำลังโหลดรายละเอียด...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        {error || 'ไม่พบข้อมูลใบแจ้งซ่อม'}
      </div>
    );
  }

  const isOwner = user?.id === request.requesterId;
  const isManager = user?.id === request.managerId;
  const isAssignedTech = user?.id === request.technicianId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-accent">
                {request.requestNo}
              </span>
              <StatusBadge status={request.status as RequestStatus} />
              <PriorityBadge priority={request.priority as Priority} />
            </div>
            <h1 className="text-xl font-bold text-primary mt-1">{request.title}</h1>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Manager Actions */}
          {isManager && request.status === 'PENDING_MANAGER' && (
            <>
              <button
                onClick={() => handleAction('accept')}
                disabled={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>รับเรื่อง</span>
              </button>
              <button
                onClick={() =>
                  setNoteModal({
                    open: true,
                    title: 'ปฏิเสธใบแจ้งซ่อม',
                    action: 'reject',
                    required: true,
                  })
                }
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>ปฏิเสธ</span>
              </button>
            </>
          )}

          {/* Requester Cancel */}
          {isOwner && request.status === 'PENDING_MANAGER' && (
            <button
              onClick={() =>
                setNoteModal({
                  open: true,
                  title: 'ยกเลิกใบแจ้งซ่อม',
                  action: 'cancel',
                  required: false,
                })
              }
              disabled={actionLoading}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg text-sm"
            >
              ยกเลิกใบแจ้ง
            </button>
          )}

          {/* Technician Actions */}
          {isAssignedTech && request.status === 'ASSIGNED' && (
            <button
              onClick={() => handleAction('start')}
              disabled={actionLoading}
              className="bg-accent hover:bg-accent-hover text-primary font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-1.5"
            >
              <Play className="w-4 h-4" />
              <span>เริ่มปฏิบัติงาน</span>
            </button>
          )}

          {isAssignedTech && request.status === 'IN_PROGRESS' && (
            <>
              <button
                onClick={() =>
                  setNoteModal({
                    open: true,
                    title: 'ระบุสาเหตุการรออะไหล่',
                    action: 'wait-parts',
                    required: false,
                  })
                }
                disabled={actionLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4" />
                <span>รออะไหล่</span>
              </button>
              <button
                onClick={() =>
                  setNoteModal({
                    open: true,
                    title: 'บันทึกการส่งมอบงานเสร็จสิ้น',
                    action: 'complete',
                    required: false,
                  })
                }
                disabled={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>ซ่อมเสร็จสิ้น</span>
              </button>
            </>
          )}

          {isAssignedTech && request.status === 'WAITING_PARTS' && (
            <button
              onClick={() => handleAction('resume')}
              disabled={actionLoading}
              className="bg-accent hover:bg-accent-hover text-primary font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-1.5"
            >
              <Play className="w-4 h-4" />
              <span>ได้อะไหล่แล้ว / ทำงานต่อ</span>
            </button>
          )}

          {/* Requester Close or Reopen */}
          {isOwner && request.status === 'COMPLETED' && (
            <>
              <button
                onClick={() => handleAction('close')}
                disabled={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>ยืนยันปิดงาน</span>
              </button>
              <button
                onClick={() =>
                  setNoteModal({
                    open: true,
                    title: 'แจ้งซ่อมไม่ผ่าน / ขอให้ทำใหม่',
                    action: 'reopen',
                    required: true,
                  })
                }
                disabled={actionLoading}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ซ่อมไม่ผ่าน</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Manager Assigning Section */}
      {isManager && request.status === 'ACCEPTED' && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-sky-900">มอบหมายงานให้ช่างในทีม</h3>
            <p className="text-xs text-sky-700">เลือกช่างสังกัดของคุณเพื่อเริ่มดำเนินการซ่อม</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="text-sm border border-sky-300 rounded-lg px-3 py-1.5 bg-white text-secondary"
            >
              <option value="">-- เลือกช่างผู้รับผิดชอบ --</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                handleAction('assign', { technicianId: selectedTechId })
              }
              disabled={!selectedTechId || actionLoading}
              className="bg-accent hover:bg-accent-hover text-primary font-semibold px-4 py-1.5 rounded-lg text-sm disabled:opacity-50"
            >
              มอบหมาย
            </button>
          </div>
        </div>
      )}

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-primary border-b border-slate-100 pb-2">
              รายละเอียดการแจ้งซ่อม
            </h2>
            <p className="text-sm text-secondary whitespace-pre-line leading-relaxed">
              {request.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-xs text-secondary border-t border-slate-100">
              <div>
                <span className="text-slate-400 block mb-0.5">สถานที่:</span>
                <span className="font-medium text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {request.location?.name} ({request.location?.type})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">หมวดหมู่:</span>
                <span className="font-medium text-slate-700">{request.category?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">ทรัพย์สิน/อุปกรณ์:</span>
                <span className="font-medium text-slate-700">
                  {request.asset ? `${request.asset.name} (${request.asset.assetCode})` : 'ไม่ระบุ'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">วันที่แจ้ง:</span>
                <span className="font-medium text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(request.createdAt).toLocaleString('th-TH')}
                </span>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="bg-surface rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-primary">รูปภาพประกอบ (Attachments)</h2>
              {(isOwner || isAssignedTech) && (
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files && setUploadFiles(Array.from(e.target.files))
                    }
                    className="text-xs"
                  />
                  {uploadFiles.length > 0 && (
                    <button
                      onClick={() =>
                        handleUploadSubmit(isAssignedTech ? 'AFTER' : 'BEFORE')
                      }
                      className="text-xs bg-accent text-primary px-3 py-1 rounded font-semibold"
                    >
                      อัปโหลด ({isAssignedTech ? 'รูปหลังซ่อม' : 'รูปก่อนซ่อม'})
                    </button>
                  )}
                </div>
              )}
            </div>

            {(!request.attachments || request.attachments.length === 0) ? (
              <p className="text-sm text-secondary">ไม่มีรูปภาพประกอบ</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {request.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="group relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100"
                  >
                    <img
                      src={`http://localhost:3000${att.fileUrl}`}
                      alt="Attachment"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 text-[10px] bg-primary/80 text-white px-1.5 py-0.5 rounded">
                      {att.stage === 'BEFORE' ? 'ก่อนซ่อม' : 'หลังซ่อม'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Repair Parts Section */}
          <div className="bg-surface rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-primary">รายการอะไหล่ที่ใช้ (Repair Parts)</h2>
              {isAssignedTech && (
                <button
                  onClick={() => setShowPartForm(!showPartForm)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-primary font-medium px-2.5 py-1 rounded flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มอะไหล่</span>
                </button>
              )}
            </div>

            {showPartForm && (
              <form onSubmit={handlePartSubmit} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="ชื่ออะไหล่"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  className="flex-1 text-xs border border-slate-300 rounded px-2 py-1"
                />
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="จำนวน"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-20 text-xs border border-slate-300 rounded px-2 py-1"
                />
                <button
                  type="submit"
                  className="bg-accent text-primary text-xs px-3 py-1 rounded font-semibold"
                >
                  บันทึก
                </button>
              </form>
            )}

            {(!request.repairParts || request.repairParts.length === 0) ? (
              <p className="text-sm text-secondary">ไม่มีการบันทึกรายการอะไหล่</p>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm">
                {request.repairParts.map((part) => (
                  <li key={part.id} className="py-2 flex justify-between">
                    <span className="text-primary font-medium">{part.partName}</span>
                    <span className="text-secondary">{part.quantity} ชิ้น</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Rating Section (เฉพาะ CLOSED) */}
          {request.status === 'CLOSED' && (
            <div className="bg-surface rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h2 className="text-base font-bold text-primary border-b border-slate-100 pb-2">
                การประเมินความพึงพอใจ
              </h2>

              {request.rating ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-5 h-5 ${
                          s <= request.rating!.score ? 'fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-bold text-sm text-slate-800">
                      {request.rating.score} / 5
                    </span>
                  </div>
                  {request.rating.comment && (
                    <p className="text-sm text-secondary bg-slate-50 p-3 rounded-lg border border-slate-100">
                      "{request.rating.comment}"
                    </p>
                  )}
                </div>
              ) : isOwner ? (
                <form onSubmit={handleRatingSubmit} className="space-y-3">
                  <p className="text-sm text-secondary">
                    กรุณาประเมินผลการให้บริการสำหรับงานซ่อมนี้:
                  </p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setScore(s)}
                        className="p-1 text-amber-400 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            s <= score ? 'fill-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    placeholder="ข้อคิดเห็นเพิ่มเติม (ถ้ามี)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2"
                  ></textarea>
                  <button
                    type="submit"
                    className="bg-accent text-primary px-4 py-1.5 rounded-lg text-sm font-semibold"
                  >
                    ส่งแบบประเมิน
                  </button>
                </form>
              ) : (
                <p className="text-sm text-secondary">ยังไม่มีการประเมิน</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: People Involved & Timeline */}
        <div className="space-y-6">
          <div className="bg-surface rounded-xl shadow-sm border border-slate-200 p-6 space-y-3">
            <h3 className="text-sm font-bold text-primary border-b border-slate-100 pb-2">
              ผู้เกี่ยวข้อง
            </h3>
            <div className="text-xs space-y-2">
              <div>
                <span className="text-slate-400">ผู้แจ้งซ่อม:</span>
                <p className="font-semibold text-slate-800">{request.requester?.name}</p>
                <p className="text-slate-500">{request.requester?.email}</p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400">หัวหน้าผู้ดูแลอาคาร:</span>
                <p className="font-semibold text-slate-800">{request.manager?.name}</p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400">ช่างที่รับผิดชอบ:</span>
                <p className="font-semibold text-slate-800">
                  {request.technician ? request.technician.name : 'ยังไม่มอบหมาย'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-primary border-b border-slate-100 pb-2">
              ไทม์ไลน์การดำเนินงาน (Timeline)
            </h3>
            <RequestTimeline logs={request.requestLogs || []} />
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {noteModal.open && (
        <div className="fixed inset-0 bg-primary/40 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-primary">{noteModal.title}</h3>
            <textarea
              rows={3}
              required={noteModal.required}
              placeholder={noteModal.required ? 'ระบุเหตุผล (จำเป็น)...' : 'บันทึกเพิ่มเติม (ถ้ามี)...'}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-accent"
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setNoteModal({ open: false, title: '', action: '', required: false })}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleAction(noteModal.action, { note: noteText })}
                disabled={noteModal.required && !noteText.trim()}
                className="bg-accent text-primary px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
