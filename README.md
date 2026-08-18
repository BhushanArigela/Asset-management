# Sheraton Hotel — Asset Management System

A comprehensive enterprise asset management system built for The Sheraton Hotel.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: MySQL 8+
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5 (Auth.js)
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack Table
- **QR Codes**: qrcode (generation) + html5-qrcode (scanning)
- **Excel**: ExcelJS
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+
- MySQL 8+ server running
- npm

## Getting Started

### 1. Install Dependencies

```bash
cd sheraton-asset-mgmt
npm install
```

### 2. Configure Environment

Copy the example environment file and update with your MySQL credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/sheraton_assets"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
```

### 3. Create the Database

Create the MySQL database:
```sql
CREATE DATABASE sheraton_assets CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run Migrations

Push the Prisma schema to MySQL:
```bash
npm run db:push
```

Generate the Prisma client:
```bash
npm run db:generate
```

### 5. Seed Default Data

This creates the admin user, default roles, permissions, asset statuses, conditions, and vendor types:

```bash
npm run db:seed
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Login Credentials

| Field | Value |
|---|---|
| Email | `admin@sheraton.com` |
| Password | `admin123` |

> ⚠️ **Change the default password immediately after first login in production.**

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:seed` | Seed default data |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:migrate` | Run database migrations |
| `npm run db:reset` | Reset database and re-seed |

## Modules

### 1. Authentication
- Secure email/password login
- Session management with JWT
- Route protection middleware

### 2. User Management
- User CRUD with role assignment
- Role management with granular permission matrix
- 35+ permission types across 11 modules

### 3. Master Data
- **Location Hierarchy**: Company → Building → Floor → Room
- **Department Management**
- **Asset Classification**: Categories, Sub-categories, Brands, Conditions, Statuses
- **Vendor Management**: Unified vendor table with multi-type support (Supplier, Maintenance, Warranty, AMC)

### 4. Asset Management
- Asset registration with auto-generated ID (SH-AST-YYYYMMDD-NNNN)
- Asset detail view with tabbed interface
- Status & condition tracking with history
- Document & photo management
- Warranty management with expiry tracking
- AMC management with expiry tracking
- QR code generation, scanning & batch printing
- Asset transfer & movement tracking
- Maintenance request management
- Asset disposal workflow
- Bulk Excel import/export

### 5. Search & Reporting
- Advanced search with 14+ filter criteria
- Interactive dashboard with KPI cards and charts
- 15+ report types with Excel export
- Report filtering, sorting, and date-range selection

### 6. Asset Auditing
- Physical verification audit sessions
- QR-based asset scanning
- Expected vs. verified asset comparison
- Audit classification (Verified, Missing, Wrong Location, Damaged, Unexpected)
- Audit completion and locking
- Comprehensive audit reports

### 7. System Audit Logs
- Complete activity logging for all CRUD operations
- User, module, entity, and action tracking
- Previous/new value recording for all changes
- Search, filter, and export audit logs

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login page
│   ├── (dashboard)/     # Protected app pages
│   │   ├── assets/      # Asset management
│   │   ├── maintenance/ # Maintenance requests
│   │   ├── movements/   # Asset transfers
│   │   ├── masters/     # Master data management
│   │   ├── reports/     # Reports
│   │   ├── audits/      # Physical audits
│   │   ├── audit-logs/  # System audit logs
│   │   ├── users/       # User management
│   │   └── roles/       # Role management
│   └── api/             # API routes
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Sidebar, Header, Breadcrumbs
│   ├── assets/          # Asset-specific components
│   ├── maintenance/     # Maintenance components
│   ├── movements/       # Movement components
│   ├── masters/         # Master data components
│   ├── reports/         # Report components
│   ├── audits/          # Audit components
│   ├── audit-logs/      # Audit log components
│   ├── users/           # User management components
│   ├── roles/           # Role management components
│   └── dashboard/       # Dashboard components
├── lib/                 # Utilities & configuration
└── types/               # TypeScript definitions
```

## License

Proprietary — The Sheraton Hotel
