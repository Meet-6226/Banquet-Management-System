/**
 * Seed Script — Populates MongoDB with realistic dummy data.
 *
 * Usage:  npx tsx scripts/seed.ts
 *
 * Creates:
 *   • 2 Branches (with halls)
 *   • 9 Users (one per role)
 *   • 6 Leads
 *   • 6 Bookings
 *   • 4 Events
 *   • 10 Inventory Items
 *   • 4 Vendors
 *   • 4 Invoices
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ─── Direct connection (bypasses Next.js runtime) ────────────
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/banquet-pro";

// ─── Schema imports (inline to avoid Next.js module issues) ──
// We import the compiled models directly
import "../src/models/User";
import "../src/models/Branch";
import "../src/models/Lead";
import "../src/models/Booking";
import "../src/models/Event";
import "../src/models/InventoryItem";
import "../src/models/PurchaseOrder";
import "../src/models/Invoice";
import "../src/models/Vendor";

async function seed() {
    console.log("🌱 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to", MONGODB_URI);

    // ─── Clear all collections ──────────────────────────────────
    const collections = ["users", "branches", "leads", "bookings", "events", "inventoryitems", "purchaseorders", "invoices", "vendors"];
    for (const col of collections) {
        await mongoose.connection.collection(col).deleteMany({}).catch(() => { });
    }
    console.log("🗑️  Cleared existing data");

    // ─── 1. Branches ────────────────────────────────────────────
    const Branch = mongoose.model("Branch");
    const branches = await Branch.insertMany([
        {
            name: "Royal Grand Palace",
            location: "Mumbai, Maharashtra",
            contactNumber: "+91 22 2345 6789",
            halls: [
                { name: "Grand Ballroom", capacity: 500, pricePerHour: 15000, amenities: ["AC", "Stage", "Sound System", "Projector", "Dance Floor"] },
                { name: "Crystal Lounge", capacity: 150, pricePerHour: 8000, amenities: ["AC", "Bar Counter", "Sound System"] },
                { name: "Sunset Garden", capacity: 300, pricePerHour: 12000, amenities: ["Open Air", "Lighting", "Stage", "Fountain"] },
            ],
        },
        {
            name: "The Imperial Banquets",
            location: "Pune, Maharashtra",
            contactNumber: "+91 20 3456 7890",
            halls: [
                { name: "Emperor Hall", capacity: 400, pricePerHour: 12000, amenities: ["AC", "Stage", "Projector", "Sound System"] },
                { name: "Poolside Deck", capacity: 200, pricePerHour: 10000, amenities: ["Pool View", "Open Air", "Lighting", "Bar"] },
            ],
        },
    ]);
    console.log(`✅ Created ${branches.length} branches`);

    const branch1 = branches[0];
    const branch2 = branches[1];
    const hall1 = (branch1 as any).halls[0]._id;
    const hall2 = (branch1 as any).halls[1]._id;
    const hall3 = (branch1 as any).halls[2]._id;
    const hall4 = (branch2 as any).halls[0]._id;
    const hall5 = (branch2 as any).halls[1]._id;

    // ─── 2. Users (one per role) ────────────────────────────────
    const hashedPw = await bcrypt.hash("password123", 12);

    const User = mongoose.model("User");
    const users = await User.insertMany([
        { name: "Arjun Mehta", email: "admin@banquetpro.com", password: hashedPw, role: "ADMIN", isActive: true },
        { name: "Priya Sharma", email: "manager@banquetpro.com", password: hashedPw, role: "BRANCH_MANAGER", branchId: branch1._id, isActive: true },
        { name: "Ravi Patel", email: "sales@banquetpro.com", password: hashedPw, role: "SALES_EXECUTIVE", branchId: branch1._id, isActive: true },
        { name: "Anjali Desai", email: "kitchen@banquetpro.com", password: hashedPw, role: "KITCHEN_MANAGER", branchId: branch1._id, isActive: true },
        { name: "Vikram Singh", email: "inventory@banquetpro.com", password: hashedPw, role: "INVENTORY_MANAGER", branchId: branch1._id, isActive: true },
        { name: "Neha Gupta", email: "finance@banquetpro.com", password: hashedPw, role: "FINANCE_MANAGER", isActive: true },
        { name: "Karan Joshi", email: "events@banquetpro.com", password: hashedPw, role: "EVENT_MANAGER", branchId: branch1._id, isActive: true },
        { name: "Suresh Caterers", email: "vendor@banquetpro.com", password: hashedPw, role: "VENDOR", branchId: branch1._id, isActive: true },
        { name: "Meera Kapoor", email: "customer@banquetpro.com", password: hashedPw, role: "CUSTOMER", isActive: true },
    ]);
    console.log(`✅ Created ${users.length} users (password: password123)`);

    const admin = users[0];
    const branchManager = users[1];
    const salesExec = users[2];
    const financeManager = users[5];
    const eventManager = users[6];
    const customer = users[8];

    // ─── 3. Leads ───────────────────────────────────────────────
    const now = new Date();
    const Lead = mongoose.model("Lead");
    const leads = await Lead.insertMany([
        { name: "Sarah & Mark Wedding", email: "sarah@gmail.com", phone: "+91 98765 43210", contact: "+91 98765 43210", source: "Website", status: "Won", assignedTo: salesExec._id, branchId: branch1._id, notes: "Grand wedding, 400+ guests expected", eventDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7), guestCount: 450, budget: 300000 },
        { name: "TechNova Annual Summit", email: "events@technova.io", phone: "+91 98765 11111", contact: "+91 98765 11111", source: "Referral", status: "Won", assignedTo: salesExec._id, branchId: branch1._id, notes: "Corporate event, projector needed", eventDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14), guestCount: 120, budget: 100000 },
        { name: "Kapoor 50th Anniversary", email: "raj.kapoor@email.com", phone: "+91 98765 22222", contact: "+91 98765 22222", source: "Walk-in", status: "Negotiation", assignedTo: salesExec._id, branchId: branch1._id, notes: "Golden jubilee celebration", eventDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21), guestCount: 250, budget: 200000 },
        { name: "StartupFest 2026", email: "hello@startupfest.in", phone: "+91 98765 33333", contact: "+91 98765 33333", source: "Social Media", status: "Contacted", assignedTo: salesExec._id, branchId: branch2._id, notes: "Tech startup networking event", eventDate: new Date(now.getFullYear(), now.getMonth() + 1, 5), guestCount: 300, budget: 175000 },
        { name: "Sharma Family Reunion", email: "deepak.sharma@email.com", phone: "+91 98765 44444", contact: "+91 98765 44444", source: "Website", status: "New", assignedTo: salesExec._id, branchId: branch2._id, notes: "Family gathering, ~100 people", eventDate: new Date(now.getFullYear(), now.getMonth() + 1, 12), guestCount: 80, budget: 50000 },
        { name: "Global Banking Dinner", email: "events@globalbank.com", phone: "+91 98765 55555", contact: "+91 98765 55555", source: "Referral", status: "Lost", assignedTo: salesExec._id, branchId: branch1._id, notes: "Lost to competitor venue", eventDate: new Date(now.getFullYear(), now.getMonth() - 1, 20), guestCount: 200, budget: 250000 },
    ]);
    console.log(`✅ Created ${leads.length} leads`);

    // ─── 4. Bookings ────────────────────────────────────────────
    const Booking = mongoose.model("Booking");
    const bookings = await Booking.insertMany([
        {
            customerId: customer._id, branchId: branch1._id, hallId: hall1,
            eventName: "Sarah & Mark's Wedding Reception",
            eventDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
            startTime: "18:00", endTime: "23:00",
            guestCount: 450, status: "Confirmed",
            totalAmount: 285000, advancePaid: 100000,
        },
        {
            customerId: customer._id, branchId: branch1._id, hallId: hall2,
            eventName: "TechNova Annual Summit",
            eventDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
            startTime: "09:00", endTime: "17:00",
            guestCount: 120, status: "Confirmed",
            totalAmount: 95000, advancePaid: 50000,
        },
        {
            customerId: customer._id, branchId: branch1._id, hallId: hall3,
            eventName: "Kapoor Golden Jubilee",
            eventDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21),
            startTime: "19:00", endTime: "23:30",
            guestCount: 250, status: "Tentative",
            totalAmount: 180000, advancePaid: 30000,
        },
        {
            customerId: customer._id, branchId: branch2._id, hallId: hall4,
            eventName: "StartupFest 2026",
            eventDate: new Date(now.getFullYear(), now.getMonth() + 1, 5),
            startTime: "10:00", endTime: "18:00",
            guestCount: 300, status: "Tentative",
            totalAmount: 150000, advancePaid: 0,
        },
        {
            customerId: customer._id, branchId: branch2._id, hallId: hall5,
            eventName: "Sharma Family Reunion",
            eventDate: new Date(now.getFullYear(), now.getMonth() + 1, 12),
            startTime: "12:00", endTime: "16:00",
            guestCount: 80, status: "Confirmed",
            totalAmount: 45000, advancePaid: 20000,
        },
        {
            customerId: customer._id, branchId: branch1._id, hallId: hall1,
            eventName: "Annual Charity Gala",
            eventDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
            startTime: "19:00", endTime: "23:00",
            guestCount: 400, status: "Confirmed",
            totalAmount: 320000, advancePaid: 320000,
        },
    ]);
    console.log(`✅ Created ${bookings.length} bookings`);

    // ─── 5. Events ──────────────────────────────────────────────
    const Event = mongoose.model("Event");
    const events = await Event.insertMany([
        {
            bookingId: bookings[0]._id,
            menuItems: [
                { name: "Welcome Drinks", qtyPerGuest: 2, unitCost: 150 },
                { name: "Paneer Tikka", qtyPerGuest: 3, unitCost: 80 },
                { name: "Biryani", qtyPerGuest: 1, unitCost: 250 },
                { name: "Gulab Jamun", qtyPerGuest: 2, unitCost: 60 },
            ],
            guestCount: 450, extraCharges: 15000,
            status: "Planned",
        },
        {
            bookingId: bookings[1]._id,
            menuItems: [
                { name: "Tea/Coffee", qtyPerGuest: 3, unitCost: 30 },
                { name: "Sandwich Platter", qtyPerGuest: 2, unitCost: 120 },
                { name: "Cookies", qtyPerGuest: 2, unitCost: 40 },
            ],
            guestCount: 120, extraCharges: 5000,
            status: "Planned",
        },
        {
            bookingId: bookings[4]._id,
            menuItems: [
                { name: "Buffet Lunch", qtyPerGuest: 1, unitCost: 500 },
                { name: "Soft Drinks", qtyPerGuest: 2, unitCost: 50 },
            ],
            guestCount: 80, extraCharges: 2000,
            status: "Planned",
        },
        {
            bookingId: bookings[5]._id,
            menuItems: [
                { name: "Gala Dinner", qtyPerGuest: 1, unitCost: 800 },
                { name: "Champagne", qtyPerGuest: 2, unitCost: 350 },
                { name: "Dessert Platter", qtyPerGuest: 1, unitCost: 200 },
            ],
            guestCount: 400, extraCharges: 25000,
            status: "Planned",
        },
    ]);
    console.log(`✅ Created ${events.length} events`);

    // ─── 6. Inventory ───────────────────────────────────────────
    const InventoryItem = mongoose.model("InventoryItem");
    const inventoryItems = await InventoryItem.insertMany([
        { branchId: branch1._id, name: "Crystal Stemware", quantity: 14, unit: "pieces", threshold: 50 },
        { branchId: branch1._id, name: "Table Linens (Cream)", quantity: 32, unit: "pieces", threshold: 80 },
        { branchId: branch1._id, name: "Dinner Plates", quantity: 480, unit: "pieces", threshold: 200 },
        { branchId: branch1._id, name: "Napkins (Gold)", quantity: 350, unit: "pieces", threshold: 100 },
        { branchId: branch1._id, name: "Serving Spoons", quantity: 65, unit: "pieces", threshold: 30 },
        { branchId: branch1._id, name: "Candle Holders", quantity: 28, unit: "pieces", threshold: 40 },
        { branchId: branch1._id, name: "Floral Centerpieces", quantity: 8, unit: "pieces", threshold: 15 },
        { branchId: branch2._id, name: "Dinner Plates", quantity: 300, unit: "pieces", threshold: 150 },
        { branchId: branch2._id, name: "Table Linens (White)", quantity: 45, unit: "pieces", threshold: 40 },
        { branchId: branch2._id, name: "Water Goblets", quantity: 180, unit: "pieces", threshold: 100 },
    ]);
    console.log(`✅ Created ${inventoryItems.length} inventory items`);

    // ─── 7. Vendors ─────────────────────────────────────────────
    const Vendor = mongoose.model("Vendor");
    const vendors = await Vendor.insertMany([
        { name: "Suresh Caterers", serviceType: "Catering", contact: "+91 98765 00001", rating: 4.8, branchId: branch1._id },
        { name: "BrewCo Beverages", serviceType: "Beverages", contact: "+91 98765 00002", rating: 4.5, branchId: branch1._id },
        { name: "SparkCare Cleaning", serviceType: "Cleaning", contact: "+91 98765 00003", rating: 4.2, branchId: branch1._id },
        { name: "Bloom & Petal Florists", serviceType: "Decoration", contact: "+91 98765 00004", rating: 4.9, branchId: branch2._id },
    ]);
    console.log(`✅ Created ${vendors.length} vendors`);

    // ─── 8. Invoices ────────────────────────────────────────────
    const Invoice = mongoose.model("Invoice");
    const invoices = await Invoice.insertMany([
        { bookingId: bookings[0]._id, totalAmount: 285000, taxAmount: 51300, advancePaid: 100000 },
        { bookingId: bookings[1]._id, totalAmount: 95000, taxAmount: 17100, advancePaid: 50000 },
        { bookingId: bookings[4]._id, totalAmount: 45000, taxAmount: 8100, advancePaid: 20000 },
        { bookingId: bookings[5]._id, totalAmount: 320000, taxAmount: 57600, advancePaid: 320000 },
    ]);
    console.log(`✅ Created ${invoices.length} invoices`);

    // ─── Summary ────────────────────────────────────────────────
    console.log("\n🎉 Seed complete! Summary:");
    console.log("─────────────────────────────────");
    console.log(`  Branches:   ${branches.length}`);
    console.log(`  Users:      ${users.length}`);
    console.log(`  Leads:      ${leads.length}`);
    console.log(`  Bookings:   ${bookings.length}`);
    console.log(`  Events:     ${events.length}`);
    console.log(`  Inventory:  ${inventoryItems.length}`);
    console.log(`  Vendors:    ${vendors.length}`);
    console.log(`  Invoices:   ${invoices.length}`);
    console.log("─────────────────────────────────");
    console.log("\n🔑 Login credentials (all use same password):");
    console.log("  Password: password123");
    console.log("  Admin:          admin@banquetpro.com");
    console.log("  Branch Manager: manager@banquetpro.com");
    console.log("  Sales Exec:     sales@banquetpro.com");
    console.log("  Finance Mgr:    finance@banquetpro.com");
    console.log("  Event Mgr:      events@banquetpro.com");
    console.log("  Customer:       customer@banquetpro.com");

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
