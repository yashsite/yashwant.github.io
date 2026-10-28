# PropStream Middleware — Real Estate Lead Data Warehouse & CRM Distribution Platform

Enterprise Lead Middleware Platform that ingests leads strictly from **5 predefined real estate channels**, validates and deduplicates them in a centralized **PostgreSQL Lead Master Database**, and distributes them in **Real-Time (1–5s SLA)** or **Scheduled Batch Intervals** to connected CRM systems (**Sell.do, LeadSquared, and Custom Webhook CRMs**) via **Redis + BullMQ**.

---

## 🏗️ System Architecture & Tech Stack

- **Frontend (`apps/web-dashboard`)**: Next.js 14 (App Router), React 18, Tailwind CSS, Chart.js
- **Standalone Interactive Preview (`apps/web-dashboard/public/index.html`)**: Self-contained single-file interactive application with Executive Dashboard, Lead Master Warehouse, Bulk CSV/Excel/Google Sheet Validator, Webhook Simulator, CRM Mapping, BullMQ Worker Stream, Reports Export, RBAC 1-Click Google/WhatsApp/GitHub Login, and REST API Explorer.
- **Backend (`apps/api-middleware`)**: Node.js 20, NestJS 10, Prisma ORM, BullMQ + Redis
- **Database**: PostgreSQL 16 (Composite unique deduplication index on `(normalized_phone, project_id)`)
- **Storage**: AWS S3 (Presigned bulk upload storage for `.xlsx`, `.xls`, `.csv` & error reports)
- **CI/CD**: GitHub Actions (`.github/workflows/deploy-aws.yml`) + Docker Compose

---

## 🎯 Strict Lead Ingestion Channels (Only)

1. **Google Sheets / Excel Upload** (`.xlsx`, `.xls`, `.csv`, Google Sheets Cloud Sync)
2. **Meta Lead Ads** (Meta Graph API + Webhooks for Facebook & Instagram Lead Forms)
3. **Google Ads Leads** (Google Lead Form Extensions, Webhook & CSV Import)
4. **LinkedIn Lead Gen Forms** (LinkedIn Marketing API & Sponsored Lead Forms)
5. **Apollo Leads** (Apollo B2B Enrichment API & CSV/Excel Upload)

---

## 🔑 Role-Based Access Control (RBAC) & 1-Click SSO Policy

Self-registration is strictly disabled. Users can sign in via **1-Click Google Workspace SSO**, **1-Click WhatsApp OTP**, or **1-Click GitHub OAuth** **ONLY** if their Google Email and WhatsApp Number have been pre-assigned and whitelisted by a **Super Admin** or **Admin**.

| Role | Name | Assigned Google Email | Assigned WhatsApp No. | Password |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Yashwant Pandit | `superadmin@propstream.io` | `+91 98450 00001` | `Super@Prop2026!` |
| **Admin** | Amit Agrawal | `admin@propstream.io` | `+91 98450 00002` | `Admin@Prop2026!` |
| **Manager** | Rajeshwari Iyer | `manager@propstream.io` | `+91 98450 00003` | `Manager@Prop2026!` |
| **Operations Team** | Kiran Kumar | `ops@propstream.io` | `+91 98450 00004` | `Ops@Prop2026!` |
| **Sales Team** | Sneha Reddy | `sales@propstream.io` | `+91 98450 00005` | `Sales@Prop2026!` |

---

## 🚀 Quick Start (Local Development & GitHub Push)

### 1. Push This Repository to GitHub
```bash
git init
git remote add origin https://github.com/tantumsoft-proptech/real-estate-lead-warehouse.git
git checkout -b main
git add .
git commit -m "feat: initial commit of Real Estate Lead Data Warehouse & CRM Middleware"
git push -u origin main
```

### 2. Start PostgreSQL & Redis via Docker Compose
```bash
cp .env.example .env
docker-compose up -d postgres redis
```

### 3. Run Database Migrations & Seed
```bash
npm install
npx prisma migrate dev --schema=apps/api-middleware/prisma/schema.prisma
npx prisma db seed
```

### 4. Start NestJS Backend & Next.js Frontend
```bash
npm run dev
```
