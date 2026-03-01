// ─── User Roles ──────────────────────────────────────────────
export const USER_ROLES = {
    ADMIN: 'ADMIN',
    BRANCH_MANAGER: 'BRANCH_MANAGER',
    SALES_EXECUTIVE: 'SALES_EXECUTIVE',
    KITCHEN_MANAGER: 'KITCHEN_MANAGER',
    INVENTORY_MANAGER: 'INVENTORY_MANAGER',
    FINANCE_MANAGER: 'FINANCE_MANAGER',
    EVENT_MANAGER: 'EVENT_MANAGER',
    VENDOR: 'VENDOR',
    CUSTOMER: 'CUSTOMER',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ALL_ROLES = Object.values(USER_ROLES);

// ─── Booking Statuses ────────────────────────────────────────
export const BOOKING_STATUSES = {
    CONFIRMED: 'Confirmed',
    TENTATIVE: 'Tentative',
    CANCELLED: 'Cancelled',
} as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];

// ─── Lead Statuses (pipeline stages) ─────────────────────────
export const LEAD_STATUSES = {
    NEW: 'New',
    CONTACTED: 'Contacted',
    PROPOSAL: 'Proposal',
    NEGOTIATION: 'Negotiation',
    WON: 'Won',
    LOST: 'Lost',
} as const;

export type LeadStatus = (typeof LEAD_STATUSES)[keyof typeof LEAD_STATUSES];

// ─── Payment Statuses ────────────────────────────────────────
export const PAYMENT_STATUSES = {
    UNPAID: 'Unpaid',
    PARTIAL: 'Partial',
    PAID: 'Paid',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

// ─── Purchase Order Statuses ─────────────────────────────────
export const PO_STATUSES = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
} as const;

export type POStatus = (typeof PO_STATUSES)[keyof typeof PO_STATUSES];
