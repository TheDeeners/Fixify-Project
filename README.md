# Fixify: Maintenance Request System (ระบบแจ้งซ่อม)

ระบบแจ้งซ่อมและติดตามสถานะงานซ่อมบำรุงอาคารและสถานที่ ออกแบบสถาปัตยกรรมระดับองค์กร (Enterprise Architecture) แบ่งระดับผู้ใช้งานตามบทบาทและพื้นที่รับผิดชอบ (Role-Based Access Control with Location Scoping)

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Axios
- **Backend:** Node.js, Express.js, TypeScript, Zod, Argon2, JWT, Swagger UI
- **Database:** PostgreSQL (ติดตั้งภายในเครื่อง), Prisma ORM
- **Package Manager:** npm (workspaces)

---

## 📦 โครงสร้างระบบ (Architecture Overview)

```text
Fixify/
├── backend/
│   ├── prisma/             # Schema & Seed script
│   └── src/
│       ├── config/         # Environment, Swagger config
│       ├── lib/            # Prisma, JWT, Argon2 helpers
│       ├── middlewares/    # Auth, Role, Zod Validate, Upload, Error handler
│       ├── modules/        # Module แยกตาม Domain (Routes, Controller, Service, Schema)
│       ├── types/          # Express type declaration
│       └── utils/          # AppError, asyncHandler
└── frontend/
    └── src/
        ├── components/     # UI, Layout, Request components
        ├── contexts/       # AuthContext
        ├── features/       # หน้า UI แยกตาม Role (Requester, Manager, Technician, Admin)
        ├── lib/            # Axios API instance
        └── routes/         # ProtectedRoute, RoleRoute
```

---

## 🚀 วิธีการติดตั้งและรันระบบ (Setup & Running)

### 1. ความต้องการเบื้องต้น (Prerequisites)
- Node.js (v18 หรือสูงกว่า)
- PostgreSQL (ติดตั้งและเปิด Service บนเครื่องเรียบร้อยแล้ว)

### 2. ตั้งค่า Database
สร้าง Database ใน PostgreSQL เช่น:
```sql
CREATE DATABASE fixify_db;
```

### 3. ตั้งค่าไฟล์ Environment
- สร้างไฟล์ `backend/.env` จาก `backend/.env.example`
- ปรับค่า `DATABASE_URL` ให้ตรงกับ PostgreSQL ของคุณ เช่น:
  ```env
  DATABASE_URL="postgresql://postgres:password@localhost:5432/fixify_db?schema=public"
  JWT_SECRET="your-super-secret-jwt-key"
  PORT=3000
  CLIENT_URL="http://localhost:3001"
  ```
- สร้างไฟล์ `frontend/.env` จาก `frontend/.env.example`

### 4. ติดตั้ง Dependencies และ Generate Prisma Client
รันคำสั่งที่ Root directory:
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 5. เริ่มต้นการทำงาน (Start Development Server)
- Backend (Port 3000):
  ```bash
  npm run dev:backend
  ```
- Frontend (Port 3001):
  ```bash
  npm run dev:frontend
  ```

---

## 📖 API Documentation & Postman
- **Swagger UI:** เปิดเบราว์เซอร์ไปที่ `http://localhost:3000/api-docs`
- **Postman Collection:** สามารถนำไฟล์ `docs/postman/fixify.postman_collection.json` ไป Import ใน Postman ได้ทันที
