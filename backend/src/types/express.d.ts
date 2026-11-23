import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: Role;
      managerId?: string | null;
      isActive: boolean;
    }

    interface Request {
      user?: User;
    }
  }
}
