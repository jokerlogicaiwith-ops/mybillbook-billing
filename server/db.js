const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'billing.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      gstin TEXT,
      address TEXT,
      upi_id TEXT,
      tagline TEXT,
      terms TEXT
    );

    CREATE TABLE IF NOT EXISTS parties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      type TEXT NOT NULL DEFAULT 'customer', -- 'customer', 'vendor', 'both'
      gstin TEXT,
      address TEXT,
      state TEXT DEFAULT 'Bihar',
      opening_balance REAL DEFAULT 0,
      current_balance REAL DEFAULT 0, -- positive: to collect, negative: to pay
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      item_code TEXT,
      hsn_code TEXT,
      category TEXT DEFAULT 'General',
      unit TEXT DEFAULT 'PCS',
      sale_price REAL NOT NULL DEFAULT 0,
      purchase_price REAL NOT NULL DEFAULT 0,
      tax_rate REAL DEFAULT 18, -- 0, 5, 12, 18, 28
      stock_qty REAL DEFAULT 0,
      low_stock_limit REAL DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      txn_no TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL, -- 'Sales Invoices', 'Quotation / Estimate', 'Payment In', 'Purchase Bills', 'Payment Out', 'Expense'
      date TEXT NOT NULL,
      party_id INTEGER,
      party_name TEXT NOT NULL,
      subtotal REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      amount REAL NOT NULL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      balance_due REAL DEFAULT 0,
      payment_type TEXT DEFAULT 'Credit', -- 'Cash', 'Bank', 'Online', 'Credit'
      status TEXT DEFAULT 'Unpaid', -- 'Paid', 'Unpaid', 'Partial'
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS transaction_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id INTEGER NOT NULL,
      item_id INTEGER,
      item_name TEXT NOT NULL,
      hsn_code TEXT,
      quantity REAL NOT NULL DEFAULT 1,
      unit TEXT DEFAULT 'PCS',
      rate REAL NOT NULL,
      discount REAL DEFAULT 0,
      tax_rate REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      total REAL NOT NULL,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bank_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      account_number TEXT,
      ifsc TEXT,
      balance REAL DEFAULT 0
    );
  `);

  // Check if seed data exists
  const companyCheck = db.prepare('SELECT COUNT(*) as count FROM company_settings').get();
  if (companyCheck.count === 0) {
    db.prepare(`
      INSERT INTO company_settings (name, phone, email, gstin, address, upi_id, tagline, terms)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'APOORV',
      '8130140936',
      'apoorv@enterprise.com',
      '10AABCA1234F1Z5',
      'Station Road, Samastipur, Bihar - 848101',
      '8130140936@upi',
      'Quality Feeds & Engineering Solutions',
      '1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if payment is not received within due date.\n3. Subject to Samastipur jurisdiction.'
    );

    // Seed Parties
    const insertParty = db.prepare(`
      INSERT INTO parties (name, phone, type, gstin, address, state, opening_balance, current_balance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const p1 = insertParty.run('DIVYADRISHTI FEEDS PVT. LTD.', '9876543210', 'customer', '10AAACD5544K1ZR', 'Industrial Area, Hajipur', 'Bihar', 0, 254435);
    const p2 = insertParty.run('AVYAAN', '9123456780', 'customer', '10BBBPB8899M1ZQ', 'Market Complex, Patna', 'Bihar', 0, 47600);
    const p3 = insertParty.run('EXECUTIVE ENGINEER FLOOD CONTROL DIVISION SAMASTIPUR', '0627422345', 'customer', '10GOVTF1234L1ZS', 'Govt Office Campus, Samastipur', 'Bihar', 0, 132500);
    const p4 = insertParty.run('SHREE KRISHNA TRADERS', '9431200000', 'vendor', '10XYZPK9988H1ZV', 'Muzaffarpur Goods Hub', 'Bihar', 0, -2592460);

    // Seed Items
    const insertItem = db.prepare(`
      INSERT INTO items (name, item_code, hsn_code, category, unit, sale_price, purchase_price, tax_rate, stock_qty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertItem.run('Poultry Feed Premium Gold 50kg', 'FEED-50KG', '2309', 'Feeds', 'BAG', 1850, 1600, 5, 240);
    insertItem.run('Layer Feed Mesh 50kg', 'LAYER-50KG', '2309', 'Feeds', 'BAG', 1720, 1500, 5, 180);
    insertItem.run('High Tensile Galvanized Wire Mesh', 'MESH-HTG', '7314', 'Hardware', 'ROLL', 3200, 2700, 18, 45);
    insertItem.run('Heavy Duty Water Pumps 5HP', 'PUMP-5HP', '8413', 'Machinery', 'PCS', 18500, 15500, 18, 12);
    insertItem.run('Calcium & Vitamin Mineral Pre-Mix', 'VIT-PREMIX', '2309', 'Supplements', 'KG', 450, 380, 12, 100);

    // Seed Bank Accounts
    const insertBank = db.prepare(`
      INSERT INTO bank_accounts (name, account_number, ifsc, balance)
      VALUES (?, ?, ?, ?)
    `);

    insertBank.run('Cash in Hand', 'CASH', '', 45805);
    insertBank.run('State Bank of India (A/C: ...4093)', '38920199281', 'SBIN0000123', 169000);

    // Seed Transactions matching user's screenshot
    const insertTxn = db.prepare(`
      INSERT INTO transactions (txn_no, type, date, party_id, party_name, subtotal, tax_amount, amount, paid_amount, balance_due, payment_type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTxn.run('184', 'Quotation / Estimate', '2026-09-13', p1.lastInsertRowid, 'DIVYADRISHTI FEEDS PVT. LTD.', 156567.62, 7828.38, 164396, 0, 164396, 'Credit', 'Unpaid');
    insertTxn.run('183', 'Quotation / Estimate', '2026-09-11', p1.lastInsertRowid, 'DIVYADRISHTI FEEDS PVT. LTD.', 85751.43, 4287.57, 90039, 0, 90039, 'Credit', 'Unpaid');
    insertTxn.run('1', 'Payment In', '2026-07-08', p2.lastInsertRowid, 'AVYAAN', 5500, 0, 5500, 5500, 0, 'Bank', 'Paid');
    insertTxn.run('A/SL/1222', 'Sales Invoices', '2026-07-08', p2.lastInsertRowid, 'AVYAAN', 45000, 8100, 53100, 5500, 47600, 'Credit', 'Partial');
    insertTxn.run('1382', 'Quotation / Estimate', '2026-05-22', p3.lastInsertRowid, 'EXECUTIVE ENGINEER FLOOD CONTROL DIVISION SAMASTIPUR', 112288.14, 20211.86, 132500, 0, 132500, 'Credit', 'Unpaid');
  }
}

initDb();

module.exports = db;
