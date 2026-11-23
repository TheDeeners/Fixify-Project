export type Role = 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'REQUESTER';

export type RequestStatus =
  | 'PENDING_MANAGER'
  | 'ACCEPTED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_PARTS'
  | 'COMPLETED'
  | 'CLOSED'
  | 'REJECTED'
  | 'CANCELLED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type LocationType = 'BUILDING' | 'FLOOR' | 'ROOM' | 'AREA';

export type AttachmentStage = 'BEFORE' | 'AFTER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  managerId?: string | null;
  isActive: boolean;
  createdAt?: string;
  manager?: { id: string; name: string };
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  parentId?: string | null;
  parent?: { id: string; name: string; type: LocationType };
  locationManager?: {
    manager: { id: string; name: string; email: string };
  };
}

export interface Category {
  id: string;
  name: string;
  _count?: { requests: number };
}

export interface Asset {
  id: string;
  name: string;
  assetCode: string;
  locationId: string;
  location?: { id: string; name: string; type: LocationType };
}

export interface RequestLog {
  id: string;
  requestId: string;
  userId: string;
  action: string;
  oldStatus?: RequestStatus | null;
  newStatus?: RequestStatus | null;
  note?: string | null;
  createdAt: string;
  user?: { id: string; name: string; role: Role };
}

export interface Attachment {
  id: string;
  requestId: string;
  uploadedBy: string;
  fileUrl: string;
  stage: AttachmentStage;
  createdAt: string;
  user?: { id: string; name: string };
}

export interface Rating {
  requestId: string;
  score: number;
  comment?: string | null;
  createdAt: string;
}

export interface RepairPart {
  id: string;
  requestId: string;
  partName: string;
  quantity: number;
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
  requestNo: string;
  title: string;
  description: string;
  categoryId: string;
  locationId: string;
  assetId?: string | null;
  priority: Priority;
  status: RequestStatus;
  requesterId: string;
  managerId: string;
  technicianId?: string | null;
  createdAt: string;
  assignedAt?: string | null;
  completedAt?: string | null;
  closedAt?: string | null;
  category?: Category;
  location?: Location;
  asset?: Asset;
  requester?: User;
  manager?: User;
  technician?: User;
  requestLogs?: RequestLog[];
  attachments?: Attachment[];
  repairParts?: RepairPart[];
  rating?: Rating;
}

export interface Notification {
  id: string;
  userId: string;
  requestId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  request?: {
    id: string;
    requestNo: string;
    title: string;
    status: RequestStatus;
  };
}
