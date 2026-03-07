# BanquetPro

A full-stack banquet and event management platform built with Next.js, MongoDB, and Tailwind CSS. It provides role-based dashboards for administrators, branch managers, event managers, and finance managers to streamline venue bookings, event coordination, inventory tracking, invoicing, and reporting.

---

## Tech Stack

| Layer     | Technology                          |
| --------- | ----------------------------------- |
| Frontend  | Next.js 16, React 19, Tailwind CSS v4 |
| Backend   | Next.js 16 API Routes, Mongoose     |
| Database  | MongoDB                             |
| Auth      | JSON Web Tokens (jsonwebtoken), bcryptjs |
| Icons     | Lucide React                        |
| Language  | TypeScript 5                        |

---

## Project Structure

```
4Musketeers-PS3/
├── backend/                   # Backend API (Next.js, port 5050)
│   ├── scripts/seed.ts        # Database seeding script
│   └── src/
│       ├── app/api/           # REST API routes
│       │   ├── auth/          # Login, register, users
│       │   ├── bookings/      # Booking CRUD
│       │   ├── branches/      # Branch CRUD
│       │   ├── events/        # Event CRUD
│       │   ├── inventory/     # Inventory CRUD
│       │   ├── invoices/      # Invoice generation
│       │   ├── leads/         # Lead management
│       │   ├── reports/       # Conversion, occupancy, revenue
│       │   └── vendors/       # Vendor CRUD
│       ├── config/constants.ts
│       ├── lib/               # DB connection, auth helpers
│       ├── middlewares/       # Auth, RBAC, branch filter, validation
│       ├── models/            # Mongoose schemas
│       └── utils/             # API response, conflict checks, inventory calc
│
├── frontend/                  # Frontend app (Next.js, port 3000)
│   └── src/
│       ├── app/
│       │   ├── admin/         # Admin panel (dashboard, bookings, managers, venues, analytics)
│       │   ├── bm/            # Branch Manager panel (dashboard, bookings, events, inventory, analytics)
│       │   ├── em/            # Event Manager panel (dashboard, calendar, clients, events, tasks, vendors, reports)
│       │   └── fm/            # Finance Manager panel (dashboard, invoices, payments, expenses, vendors, reports)
│       ├── components/        # Shared UI components (Sidebar, TopNav, CalendarGrid, MetricCard, etc.)
│       ├── context/           # AuthContext (JWT-based auth state)
│       ├── hooks/             # useAuthGuard
│       └── lib/api.ts         # Centralized API client
│
└── README.md
```

---

## Role-Based Panels

| Role              | Panel  | Key Features                                                      |
| ----------------- | ------ | ----------------------------------------------------------------- |
| **Admin**         | `/admin`  | Dashboard overview, manage bookings, venues, managers, analytics |
| **Branch Manager**| `/bm`     | Branch dashboard, bookings, events, inventory management, analytics |
| **Event Manager** | `/em`     | Calendar view, client management, event coordination, tasks, vendor coordination, reports |
| **Finance Manager** | `/fm`  | Invoices, payments, expenses, vendor payments, financial summary, reports |

### Available User Roles

`ADMIN` · `BRANCH_MANAGER` · `SALES_EXECUTIVE` · `KITCHEN_MANAGER` · `INVENTORY_MANAGER` · `FINANCE_MANAGER` · `EVENT_MANAGER` · `VENDOR` · `CUSTOMER`

---

## Getting Started

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** running locally on `mongodb://localhost:27017`

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Seed the Database

The seed script creates sample data: 2 branches, 9 users, 6 leads, 6 bookings, 4 events, 10 inventory items, 4 vendors, and 4 invoices.

```bash
cd backend
npx ts-node scripts/seed.ts
```

### 3. Run the Application

Start both servers in separate terminals:

```bash
# Terminal 1 – Backend (port 5050)
cd backend
npm run dev

# Terminal 2 – Frontend (port 3000)
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Endpoints

| Method | Endpoint                  | Description            |
| ------ | ------------------------- | ---------------------- |
| POST   | `/api/auth/register`      | Register a new user    |
| POST   | `/api/auth/login`         | Login & receive JWT    |
| GET    | `/api/auth/users`         | List users             |
| GET/POST | `/api/bookings`         | List / create bookings |
| GET/PUT/DELETE | `/api/bookings/:id` | Booking by ID        |
| GET/POST | `/api/branches`         | List / create branches |
| GET/PUT/DELETE | `/api/branches/:id` | Branch by ID         |
| GET/POST | `/api/events`           | List / create events   |
| GET/PUT/DELETE | `/api/events/:id`   | Event by ID          |
| GET/POST | `/api/inventory`        | List / create items    |
| GET/PUT/DELETE | `/api/inventory/:id`| Item by ID           |
| GET/POST | `/api/invoices`         | List / create invoices |
| GET/POST | `/api/leads`            | List / create leads    |
| GET/PUT/DELETE | `/api/leads/:id`    | Lead by ID           |
| GET/POST | `/api/vendors`          | List / create vendors  |
| GET/PUT/DELETE | `/api/vendors/:id`  | Vendor by ID         |
| GET    | `/api/reports/revenue`    | Revenue report         |
| GET    | `/api/reports/occupancy`  | Occupancy report       |
| GET    | `/api/reports/conversion` | Lead conversion report |

---

## Data Models

- **User** – name, email, password (hashed), role, branch reference
- **Branch** – name, address, halls, capacity
- **Booking** – customer, branch, hall, event date/time, guests, amount, status (Confirmed / Tentative / Cancelled)
- **Event** – booking reference, vendors, timeline, notes
- **Lead** – contact info, status pipeline (New → Contacted → Proposal → Negotiation → Won / Lost)
- **InventoryItem** – name, quantity, unit, threshold, branch reference
- **Vendor** – name, contact, services, branch reference
- **Invoice** – booking reference, line items, totals, payment status (Unpaid / Partial / Paid)
- **PurchaseOrder** – vendor, items, status (Pending / Approved / Delivered / Cancelled)

---

## Statuses Reference

| Entity   | Statuses                                                |
| -------- | ------------------------------------------------------- |
| Booking  | Confirmed, Tentative, Cancelled                        |
| Lead     | New, Contacted, Proposal Sent, Negotiation, Won, Lost  |
| Payment  | Unpaid, Partially Paid, Paid                            |
| PO       | Pending, Approved, Delivered, Cancelled                 |

---

## License

This project is developed for academic / hackathon purposes by Team 4Musketeers.
