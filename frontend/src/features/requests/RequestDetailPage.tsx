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
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
  Star,
  Plus,
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
        <div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-text-muted">กำลังโหลดรายละเอียด...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">
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
            className="p-2 hover:bg-surface border border-transparent hover:border-border rounded-lg text-text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-secondary">
                {request.requestNo}
              </span>
              <StatusBadge status={request.status as RequestStatus} />
              <PriorityBadge priority={request.priority as Priority} />
            </div>
            <h1 className="text-xl font-bold text-text mt-1">{request.title}</h1>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {isManager && request.status === 'PENDING_MANAGER' && (
            <>
              <button
                onClick={() => handleAction('accept')}
                disabled={actionLoading}
                className="bg-primary hover:bg-primary-hover text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
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
                className="bg-surface hover:bg-rose-50 text-rose-700 border border-rose-200 font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>ปฏิเสธ</span>
              </button>
            </>
          )}

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
              className="bg-surface hover:bg-background text-text-muted border border-border font-medium px-4 py-2 rounded-lg text-xs transition-colors"
            >
              ยกเลิกใบแจ้ง
            </button>
          )}

          {isAssignedTech && request.status === 'ASSIGNED' && (
            <button
              onClick={() => handleAction('start')}
              disabled={actionLoading}
              className="bg-primary hover:bg-primary-hover text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
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
                className="bg-surface hover:bg-purple-50 text-purple-800 border border-purple-200 font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
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
                className="bg-primary hover:bg-primary-hover text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
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
              className="bg-primary hover:bg-primary-hover text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>ได้อะไหล่แล้ว / ทำงานต่อ</span>
            </button>
          )}

          {isOwner && request.status === 'COMPLETED' && (
            <>
              <button
                onClick={() => handleAction('close')}
                disabled={actionLoading}
                className="bg-primary hover:bg-primary-hover text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
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
                className="bg-surface hover:bg-amber-50 text-amber-800 border border-amber-200 font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
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
        <div className="bg-surface border border-secondary/30 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="text-sm font-semibold text-text">มอบหมายงานให้ช่างในสังกัด</h3>
            <p className="text-xs text-text-muted mt-0.5">เลือกช่างในทีมของคุณเพื่อเริ่มดำเนินการซ่อม</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="text-xs border border-border rounded-lg px-3 py-2 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
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
              className="bg-primary hover:bg-primary-hover text-white font-medium px-4 py-2 rounded-lg text-xs disabled:opacity-50 transition-colors shadow-sm"
            >
              มอบหมาย
            </button>
          </div>
        </div>
      )}

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-xl shadow-sm border border-border p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted border-b border-border pb-2.5">
              รายละเอียดการแจ้งซ่อม
            </h2>
            <p className="text-sm text-text whitespace-pre-line leading-relaxed">
              {request.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-xs border-t border-border">
              <div>
                <span className="text-text-muted block mb-0.5">สถานที่:</span>
                <span className="font-medium text-text flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-text-light" />
                  {request.location?.name} ({request.location?.type})
                </span>
              </div>
              <div>
                <span className="text-text-muted block mb-0.5">หมวดหมู่:</span>
                <span className="font-medium text-text">{request.category?.name}</span>
              </div>
              <div>
                <span className="text-text-muted block mb-0.5">ทรัพย์สิน/อุปกรณ์:</span>
                <span className="font-medium text-text">
                  {request.asset ? `${request.asset.name} (${request.asset.assetCode})` : 'ไม่ระบุ'}
                </span>
              </div>
              <div>
                <span className="text-text-muted block mb-0.5">วันที่แจ้ง:</span>
                <span className="font-medium text-text flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-text-light" />
                  {new Date(request.createdAt).toLocaleString('th-TH')}
                </span>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="bg-surface rounded-xl shadow-sm border border-border p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                รูปภาพประกอบ (Attachments)
              </h2>
              {(isOwner || isAssignedTech) && (
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files && setUploadFiles(Array.from(e.target.files))
                    }
                    className="text-xs text-text-muted"
                  />
                  {uploadFiles.length > 0 && (
                    <button
                      onClick={() =>
                        handleUploadSubmit(isAssignedTech ? 'AFTER' : 'BEFORE')
                      }
                      className="text-xs bg-primary text-white px-3 py-1 rounded font-medium shadow-sm hover:bg-primary-hover transition-colors"
                    >
                      อัปโหลด ({isAssignedTech ? 'รูปหลังซ่อม' : 'รูปก่อนซ่อม'})
                    </button>
                  )}
                </div>
              )}
            </div>

            {(!request.attachments || request.attachments.length === 0) ? (
              <p className="text-xs text-text-muted">ไม่มีรูปภาพประกอบ</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {request.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="group relative rounded-lg overflow-hidden border border-border aspect-video bg-background"
                  >
                    <img
                      src={`http://localhost:3000${att.fileUrl}`}
                      alt="Attachment"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 text-[10px] bg-primary/90 text-white px-1.5 py-0.5 rounded font-medium">
                      {att.stage === 'BEFORE' ? 'ก่อนซ่อม' : 'หลังซ่อม'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Repair Parts Section */}
          <div className="bg-surface rounded-xl shadow-sm border border-border p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                รายการอะไหล่ที่ใช้ (Repair Parts)
              </h2>
              {isAssignedTech && (
                <button
                  onClick={() => setShowPartForm(!showPartForm)}
                  className="text-xs bg-background hover:bg-border text-text font-medium px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มอะไหล่</span>
                </button>
              )}
            </div>

            {showPartForm && (
              <form onSubmit={handlePartSubmit} className="p-3 bg-background rounded-lg border border-border flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="ชื่ออะไหล่"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  className="flex-1 text-xs border border-border rounded px-2.5 py-1 bg-surface"
                />
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="จำนวน"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-20 text-xs border border-border rounded px-2.5 py-1 bg-surface"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white text-xs px-3 py-1 rounded font-medium transition-colors"
                >
                  บันทึก
                </button>
              </form>
            )}

            {(!request.repairParts || request.repairParts.length === 0) ? (
              <p className="text-xs text-text-muted">ไม่มีการบันทึกรายการอะไหล่</p>
            ) : (
              <ul className="divide-y divide-border text-xs">
                {request.repairParts.map((part) => (
                  <li key={part.id} className="py-2 flex justify-between">
                    <span className="text-text font-medium">{part.partName}</span>
                    <span className="text-text-muted">{part.quantity} ชิ้น</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Rating Section (เฉพาะ CLOSED) */}
          {request.status === 'CLOSED' && (
            <div className="bg-surface rounded-xl shadow-sm border border-border p-6 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted border-b border-border pb-2.5">
                การประเมินความพึงพอใจ
              </h2>

              {request.rating ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= request.rating!.score ? 'fill-amber-400' : 'text-stone-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-bold text-sm text-text">
                      {request.rating.score} / 5
                    </span>
                  </div>
                  {request.rating.comment && (
                    <p className="text-xs text-text-muted bg-background p-3 rounded-lg border border-border">
                      "{request.rating.comment}"
                    </p>
                  )}
                </div>
              ) : isOwner ? (
                <form onSubmit={handleRatingSubmit} className="space-y-3">
                  <p className="text-xs text-text-muted">
                    กรุณาประเมินผลการให้บริการสำหรับงานซ่อมนี้:
                  </p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setScore(s)}
                        className="p-1 text-amber-400 focus:outline-none"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            s <= score ? 'fill-amber-400' : 'text-stone-300'
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
                    className="w-full text-xs border border-border rounded-lg p-2.5 bg-surface text-text"
                  ></textarea>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    ส่งแบบประเมิน
                  </button>
                </form>
              ) : (
                <p className="text-xs text-text-muted">ยังไม่มีการประเมิน</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: People Involved & Timeline */}
        <div className="space-y-6">
          <div className="bg-surface rounded-xl shadow-sm border border-border p-6 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted border-b border-border pb-2.5">
              ผู้เกี่ยวข้อง
            </h3>
            <div className="text-xs space-y-2.5">
              <div>
                <span className="text-text-muted">ผู้แจ้งซ่อม:</span>
                <p className="font-semibold text-text mt-0.5">{request.requester?.name}</p>
                <p className="text-text-light text-[11px]">{request.requester?.email}</p>
              </div>
              <div className="pt-2.5 border-t border-border">
                <span className="text-text-muted">หัวหน้าผู้ดูแลอาคาร:</span>
                <p className="font-semibold text-text mt-0.5">{request.manager?.name}</p>
              </div>
              <div className="pt-2.5 border-t border-border">
                <span className="text-text-muted">ช่างที่รับผิดชอบ:</span>
                <p className="font-semibold text-text mt-0.5">
                  {request.technician ? request.technician.name : 'ยังไม่มอบหมาย'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl shadow-sm border border-border p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted border-b border-border pb-2.5">
              ไทม์ไลน์การดำเนินงาน (Timeline)
            </h3>
            <RequestTimeline logs={request.requestLogs || []} />
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {noteModal.open && (
        <div className="fixed inset-0 bg-text/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
            <h3 className="text-base font-bold text-text">{noteModal.title}</h3>
            <textarea
              rows={3}
              required={noteModal.required}
              placeholder={noteModal.required ? 'ระบุเหตุผล (จำเป็น)...' : 'บันทึกเพิ่มเติม (ถ้ามี)...'}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full text-xs border border-border rounded-lg p-3 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setNoteModal({ open: false, title: '', action: '', required: false })}
                className="px-4 py-2 text-xs font-medium text-text-muted hover:text-text transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleAction(noteModal.action, { note: noteText })}
                disabled={noteModal.required && !noteText.trim()}
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors shadow-sm"
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
