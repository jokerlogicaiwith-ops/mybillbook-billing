const path = require('path');
const fs = require('fs');

let db;

try {
  const Database = require('better-sqlite3');
  const dbPath = path.resolve(__dirname, 'billing.db');
  db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  initSqliteDb(db);
  console.log('Loaded native SQLite database engine.');
} catch (err) {
  console.log('better-sqlite3 not compiled for current Node version. Activating Pure JS Cloud Engine.');
  db = createJsonDb();
}

function initSqliteDb(sqliteDb) {
  sqliteDb.exec(`
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
      type TEXT NOT NULL DEFAULT 'customer',
      gstin TEXT,
      address TEXT,
      state TEXT DEFAULT 'Bihar',
      opening_balance REAL DEFAULT 0,
      current_balance REAL DEFAULT 0,
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
      tax_rate REAL DEFAULT 18,
      stock_qty REAL DEFAULT 0,
      low_stock_limit REAL DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      txn_no TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      party_id INTEGER,
      party_name TEXT NOT NULL,
      subtotal REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      amount REAL NOT NULL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      balance_due REAL DEFAULT 0,
      payment_type TEXT DEFAULT 'Credit',
      status TEXT DEFAULT 'Unpaid',
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

    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'Sales Executive',
      commission_rate REAL DEFAULT 2.0,
      password TEXT DEFAULT '1234',
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const newCols = [
    "ALTER TABLE staff ADD COLUMN password TEXT DEFAULT '1234'",
    "ALTER TABLE transactions ADD COLUMN party_phone TEXT",
    "ALTER TABLE transactions ADD COLUMN party_gstin TEXT",
    "ALTER TABLE transactions ADD COLUMN party_address TEXT",
    "ALTER TABLE transactions ADD COLUMN party_city TEXT",
    "ALTER TABLE transactions ADD COLUMN party_state TEXT DEFAULT 'Bihar'",
    "ALTER TABLE transactions ADD COLUMN party_pincode TEXT",
    "ALTER TABLE transactions ADD COLUMN staff_id INTEGER",
    "ALTER TABLE transactions ADD COLUMN staff_code TEXT",
    "ALTER TABLE transactions ADD COLUMN staff_name TEXT",
    "ALTER TABLE transactions ADD COLUMN staff_commission_rate REAL DEFAULT 0",
    "ALTER TABLE transactions ADD COLUMN staff_commission_amount REAL DEFAULT 0",
    "ALTER TABLE transactions ADD COLUMN salesman_id INTEGER",
    "ALTER TABLE transactions ADD COLUMN salesman_code TEXT",
    "ALTER TABLE transactions ADD COLUMN salesman_name TEXT",
    "ALTER TABLE transactions ADD COLUMN salesman_commission_rate REAL DEFAULT 0",
    "ALTER TABLE transactions ADD COLUMN salesman_commission_amount REAL DEFAULT 0",
    "ALTER TABLE transactions ADD COLUMN accountant_id INTEGER",
    "ALTER TABLE transactions ADD COLUMN accountant_code TEXT",
    "ALTER TABLE transactions ADD COLUMN accountant_name TEXT",
    "ALTER TABLE transactions ADD COLUMN accountant_commission_rate REAL DEFAULT 0",
    "ALTER TABLE transactions ADD COLUMN accountant_commission_amount REAL DEFAULT 0",
    "ALTER TABLE company_settings ADD COLUMN billing_address TEXT",
    "ALTER TABLE company_settings ADD COLUMN city TEXT DEFAULT 'SAMASTIPUR'",
    "ALTER TABLE company_settings ADD COLUMN state TEXT DEFAULT 'Bihar'",
    "ALTER TABLE company_settings ADD COLUMN pincode TEXT DEFAULT '848101'",
    "ALTER TABLE company_settings ADD COLUMN is_gst_registered INTEGER DEFAULT 1",
    "ALTER TABLE company_settings ADD COLUMN business_type TEXT",
    "ALTER TABLE company_settings ADD COLUMN industry_type TEXT",
    "ALTER TABLE company_settings ADD COLUMN registration_type TEXT",
    "ALTER TABLE company_settings ADD COLUMN website TEXT",
    "ALTER TABLE company_settings ADD COLUMN is_active INTEGER DEFAULT 1"
  ];
  for (const colSql of newCols) {
    try { sqliteDb.exec(colSql); } catch (e) {}
  }

  const companyCheck = sqliteDb.prepare('SELECT COUNT(*) as count FROM company_settings').get();
  if (companyCheck.count === 0) {
    seedInitialSqliteData(sqliteDb);
  }
}

function seedInitialSqliteData(sqliteDb) {
  sqliteDb.prepare(`
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

  const insertParty = sqliteDb.prepare(`
    INSERT INTO parties (name, phone, type, gstin, address, state, opening_balance, current_balance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const p1 = insertParty.run('DIVYADRISHTI FEEDS PVT. LTD.', '9876543210', 'customer', '10AAACD5544K1ZR', 'Industrial Area, Hajipur', 'Bihar', 0, 2915916);
  const p2 = insertParty.run('AVYAAN', '9123456780', 'customer', '10BBBPB8899M1ZQ', 'Market Complex, Patna', 'Bihar', 0, 47600);
  const p3 = insertParty.run('EXECUTIVE ENGINEER FLOOD CONTROL DIVISION SAMASTIPUR', '0627422345', 'customer', '10GOVTF1234L1ZS', 'Govt Office Campus, Samastipur', 'Bihar', 0, 132500);
  const p4 = insertParty.run('SHREE KRISHNA TRADERS', '9431200000', 'vendor', '10XYZPK9988H1ZV', 'Muzaffarpur Goods Hub', 'Bihar', 0, -2592460);

  const insertItem = sqliteDb.prepare(`
    INSERT INTO items (name, item_code, hsn_code, category, unit, sale_price, purchase_price, tax_rate, stock_qty)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertItem.run('Poultry Feed Premium Gold 50kg', 'FEED-50KG', '2309', 'Feeds', 'BAG', 1850, 1600, 5, 239);
  insertItem.run('Layer Feed Mesh 50kg', 'LAYER-50KG', '2309', 'Feeds', 'BAG', 1720, 1500, 5, 180);
  insertItem.run('High Tensile Galvanized Wire Mesh', 'MESH-HTG', '7314', 'Hardware', 'ROLL', 3200, 2700, 18, 45);
  insertItem.run('Heavy Duty Water Pumps 5HP', 'PUMP-5HP', '8413', 'Machinery', 'PCS', 18500, 15500, 18, 12);
  insertItem.run('Calcium & Vitamin Mineral Pre-Mix', 'VIT-PREMIX', '2309', 'Supplements', 'KG', 450, 380, 12, 100);

  const insertBank = sqliteDb.prepare(`
    INSERT INTO bank_accounts (name, account_number, ifsc, balance)
    VALUES (?, ?, ?, ?)
  `);

  insertBank.run('Cash in Hand', 'CASH', '', 45805);
  insertBank.run('State Bank of India (A/C: ...4093)', '38920199281', 'SBIN0000123', 169000);

  const insertTxn = sqliteDb.prepare(`
    INSERT INTO transactions (txn_no, type, date, party_id, party_name, subtotal, tax_amount, amount, paid_amount, balance_due, payment_type, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTxn.run('184', 'Quotation / Estimate', '2026-09-13', p1.lastInsertRowid, 'DIVYADRISHTI FEEDS PVT. LTD.', 156567.62, 7828.38, 164396, 0, 164396, 'Credit', 'Unpaid');
  insertTxn.run('183', 'Quotation / Estimate', '2026-09-11', p1.lastInsertRowid, 'DIVYADRISHTI FEEDS PVT. LTD.', 85751.43, 4287.57, 90039, 0, 90039, 'Credit', 'Unpaid');
  insertTxn.run('1', 'Payment In', '2026-07-08', p2.lastInsertRowid, 'AVYAAN', 5500, 0, 5500, 5500, 0, 'Bank', 'Paid');
  insertTxn.run('A/SL/1222', 'Sales Invoices', '2026-07-08', p2.lastInsertRowid, 'AVYAAN', 45000, 8100, 53100, 5500, 47600, 'Credit', 'Partial');
  insertTxn.run('1382', 'Quotation / Estimate', '2026-05-22', p3.lastInsertRowid, 'EXECUTIVE ENGINEER FLOOD CONTROL DIVISION SAMASTIPUR', 112288.14, 20211.86, 132500, 0, 132500, 'Credit', 'Unpaid');
}

// Pure JavaScript Cloud Database (Zero compilation, 100% portable)
function createJsonDb() {
  const jsonPath = path.resolve(__dirname, 'billing-data.json');
  let store = null;

  function loadStore() {
    if (store) return store;
    if (fs.existsSync(jsonPath)) {
      try {
        store = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        if (!store.staff || !Array.isArray(store.staff) || store.staff.length === 0) {
          store.staff = [
            { id: 1, staff_code: 'STF-101', name: 'Rahul Sharma', phone: '9876501234', role: 'Senior Sales Executive', commission_rate: 5.0, password: '1234', status: 'Active', created_at: '2026-10-20' },
            { id: 2, staff_code: 'STF-102', name: 'Amit Kumar', phone: '9835123456', role: 'Sales Associate', commission_rate: 3.0, password: '1234', status: 'Active', created_at: '2026-10-21' },
            { id: 3, staff_code: 'STF-103', name: 'Pooja Singh', phone: '9430987654', role: 'Accountant / C.A.', commission_rate: 4.0, password: '1234', status: 'Active', created_at: '2026-10-22' },
            { id: 4, staff_code: 'STF-104', name: 'ABHIESH KUMAR', phone: '08936863035', role: 'Billing Executive', commission_rate: 5.0, password: '1234', status: 'Active', created_at: '2026-10-25' }
          ];
          saveStore();
        } else {
          let updated = false;
          store.staff.forEach(s => {
            if (!s.password) {
              s.password = '1234';
              updated = true;
            }
          });
          if (updated) saveStore();
        }
        return store;
      } catch (e) {}
    }

    // Default Seed Store
    store = {
      company_settings: [{
        id: 1,
        name: 'APOORV',
        phone: '8130140936',
        email: 'apoorv@enterprise.com',
        gstin: '10AABCA1234F1Z5',
        address: 'Station Road, Samastipur, Bihar - 848101',
        upi_id: '8130140936@upi',
        tagline: 'Quality Feeds & Engineering Solutions',
        terms: '1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if payment is not received within due date.\n3. Subject to Samastipur jurisdiction.'
      }],
      staff: [
        { id: 1, staff_code: 'STF-101', name: 'Rahul Sharma', phone: '9876501234', role: 'Sales Executive', commission_rate: 5.0, status: 'Active', created_at: '2026-10-20' },
        { id: 2, staff_code: 'STF-102', name: 'Amit Kumar', phone: '9835123456', role: 'Sales Associate', commission_rate: 3.0, status: 'Active', created_at: '2026-10-21' },
        { id: 3, staff_code: 'STF-103', name: 'Pooja Singh', phone: '9430987654', role: 'Billing Counter', commission_rate: 4.0, status: 'Active', created_at: '2026-10-22' }
      ],
      parties: [
        { id: 1, name: 'DIVYADRISHTI FEEDS PVT. LTD.', phone: '9876543210', type: 'customer', gstin: '10AAACD5544K1ZR', address: 'Industrial Area, Hajipur', state: 'Bihar', opening_balance: 0, current_balance: 2915916 },
        { id: 2, name: 'AVYAAN', phone: '9123456780', type: 'customer', gstin: '10BBBPB8899M1ZQ', address: 'Market Complex, Patna', state: 'Bihar', opening_balance: 0, current_balance: 47600 },
        { id: 3, name: 'EXECUTIVE ENGINEER FLOOD CONTROL DIVISION SAMASTIPUR', phone: '0627422345', type: 'customer', gstin: '10GOVTF1234L1ZS', address: 'Govt Office Campus, Samastipur', state: 'Bihar', opening_balance: 0, current_balance: 132500 },
        { id: 4, name: 'SHREE KRISHNA TRADERS', phone: '9431200000', type: 'vendor', gstin: '10XYZPK9988H1ZV', address: 'Muzaffarpur Goods Hub', state: 'Bihar', opening_balance: 0, current_balance: -2592460 }
      ],
      items: [
        { id: 1, name: 'Poultry Feed Premium Gold 50kg', item_code: 'FEED-50KG', hsn_code: '2309', category: 'Feeds', unit: 'BAG', sale_price: 1850, purchase_price: 1600, tax_rate: 5, stock_qty: 239, low_stock_limit: 5 },
        { id: 2, name: 'Layer Feed Mesh 50kg', item_code: 'LAYER-50KG', hsn_code: '2309', category: 'Feeds', unit: 'BAG', sale_price: 1720, purchase_price: 1500, tax_rate: 5, stock_qty: 180, low_stock_limit: 5 },
        { id: 3, name: 'High Tensile Galvanized Wire Mesh', item_code: 'MESH-HTG', hsn_code: '7314', category: 'Hardware', unit: 'ROLL', sale_price: 3200, purchase_price: 2700, tax_rate: 18, stock_qty: 45, low_stock_limit: 5 },
        { id: 4, name: 'Heavy Duty Water Pumps 5HP', item_code: 'PUMP-5HP', hsn_code: '8413', category: 'Machinery', unit: 'PCS', sale_price: 18500, purchase_price: 15500, tax_rate: 18, stock_qty: 12, low_stock_limit: 5 },
        { id: 5, name: 'Calcium & Vitamin Mineral Pre-Mix', item_code: 'VIT-PREMIX', hsn_code: '2309', category: 'Supplements', unit: 'KG', sale_price: 450, purchase_price: 380, tax_rate: 12, stock_qty: 100, low_stock_limit: 5 }
      ],
      transactions: [
        { id: 1, txn_no: '184', type: 'Quotation / Estimate', date: '2026-09-13', party_id: 1, party_name: 'DIVYADRISHTI FEEDS PVT. LTD.', subtotal: 156567.62, tax_amount: 7828.38, discount: 0, amount: 164396, paid_amount: 0, balance_due: 164396, payment_type: 'Credit', status: 'Unpaid', notes: '' },
        { id: 2, txn_no: '183', type: 'Quotation / Estimate', date: '2026-09-11', party_id: 1, party_name: 'DIVYADRISHTI FEEDS PVT. LTD.', subtotal: 85751.43, tax_amount: 4287.57, discount: 0, amount: 90039, paid_amount: 0, balance_due: 90039, payment_type: 'Credit', status: 'Unpaid', notes: '' },
        { id: 4, txn_no: 'A/SL/1222', type: 'Sales Invoices', date: '2026-07-08', party_id: 2, party_name: 'AVYAAN', subtotal: 45000, tax_amount: 8100, discount: 0, amount: 53100, paid_amount: 5500, balance_due: 47600, payment_type: 'Credit', status: 'Partial', notes: '' },
        { id: 3, txn_no: '1', type: 'Payment In', date: '2026-07-08', party_id: 2, party_name: 'AVYAAN', subtotal: 5500, tax_amount: 0, discount: 0, amount: 5500, paid_amount: 5500, balance_due: 0, payment_type: 'Bank', status: 'Paid', notes: '' },
        { id: 5, txn_no: '1382', type: 'Quotation / Estimate', date: '2026-05-22', party_id: 3, party_name: 'EXECUTIVE ENGINEER FLOOD CONTROL DIVISION SAMASTIPUR', subtotal: 112288.14, tax_amount: 20211.86, discount: 0, amount: 132500, paid_amount: 0, balance_due: 132500, payment_type: 'Credit', status: 'Unpaid', notes: '' }
      ],
      transaction_items: [],
      bank_accounts: [
        { id: 1, name: 'Cash in Hand', account_number: 'CASH', ifsc: '', balance: 45805 },
        { id: 2, name: 'State Bank of India (A/C: ...4093)', account_number: '38920199281', ifsc: 'SBIN0000123', balance: 169000 }
      ]
    };
    saveStore();
    return store;
  }

  function saveStore() {
    try {
      fs.writeFileSync(jsonPath, JSON.stringify(store, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to persist store:', e);
    }
  }

  loadStore();

  return {
    pragma: () => {},
    exec: () => {},
    transaction: (fn) => fn,
    prepare: (sql) => {
      const cleanSql = sql.trim().replace(/\s+/g, ' ');

      return {
        get: (...params) => {
          loadStore();
          if (cleanSql.includes('FROM company_settings')) {
            if (cleanSql.includes('WHERE id = ?')) {
              const matched = (store.company_settings || []).find(c => c.id === Number(params[0]));
              return matched || (store.company_settings && store.company_settings[0]) || {};
            }
            const active = (store.company_settings || []).find(c => c.is_active);
            return active || (store.company_settings && store.company_settings[0]) || {};
          }
          if (cleanSql.includes('SUM(current_balance) as to_collect')) {
            const sum = store.parties.filter(p => p.current_balance > 0).reduce((acc, p) => acc + p.current_balance, 0);
            return { to_collect: sum };
          }
          if (cleanSql.includes('to_pay')) {
            const sum = store.parties.filter(p => p.current_balance < 0).reduce((acc, p) => acc + Math.abs(p.current_balance), 0);
            return { to_pay: sum };
          }
          if (cleanSql.includes('SUM(balance) as total_bank')) {
            const sum = store.bank_accounts.reduce((acc, b) => acc + b.balance, 0);
            return { total_bank: sum };
          }
          if (cleanSql.includes('COUNT(*) as count FROM items WHERE stock_qty <= low_stock_limit')) {
            return { count: store.items.filter(i => i.stock_qty <= i.low_stock_limit).length };
          }
          if (cleanSql.includes('COUNT(*) as count FROM items')) {
            return { count: store.items.length };
          }
          if (cleanSql.includes('COUNT(*) as count FROM parties')) {
            return { count: store.parties.length };
          }
          if (cleanSql.includes('COUNT(*) as count FROM transactions WHERE type = ?')) {
            return { count: store.transactions.filter(t => t.type === params[0]).length };
          }
          if (cleanSql.includes('FROM parties WHERE id = ?')) {
            return store.parties.find(p => p.id === Number(params[0])) || null;
          }
          if (cleanSql.includes('FROM transactions WHERE id = ?')) {
            return store.transactions.find(t => t.id === Number(params[0])) || null;
          }
          if (cleanSql.includes('FROM transactions WHERE txn_no = ?')) {
            return store.transactions.find(t => t.txn_no === String(params[0])) || null;
          }
          if (cleanSql.includes('FROM bank_accounts LIMIT 1')) {
            return store.bank_accounts[0] || null;
          }
          if (cleanSql.includes('FROM staff WHERE id = ?')) {
            return (store.staff || []).find(s => s.id === Number(params[0])) || null;
          }
          if (cleanSql.includes('FROM staff WHERE staff_code = ?')) {
            return (store.staff || []).find(s => s.staff_code === String(params[0])) || null;
          }
          if (cleanSql.includes('COUNT(*) as count FROM staff')) {
            return { count: (store.staff || []).length };
          }
          if (cleanSql.includes('SUM(amount) as total FROM transactions WHERE type =')) {
            const match = cleanSql.match(/type = '([^']+)'/);
            const type = match ? match[1] : '';
            const sum = store.transactions.filter(t => t.type === type).reduce((acc, t) => acc + (t.amount || 0), 0);
            return { total: sum };
          }
          return null;
        },

        all: (...params) => {
          loadStore();
          if (cleanSql.includes('FROM staff')) {
            let list = [...(store.staff || [])];
            return list.sort((a, b) => a.name.localeCompare(b.name));
          }
          if (cleanSql.includes('FROM transactions') && cleanSql.includes('party_id = ?')) {
            return store.transactions.filter(t => t.party_id === Number(params[0]));
          }
          if (cleanSql.includes('FROM transaction_items WHERE transaction_id = ?')) {
            return store.transaction_items.filter(ti => ti.transaction_id === Number(params[0]));
          }
          if (cleanSql.includes('FROM transactions')) {
            let list = [...store.transactions];
            if (cleanSql.includes("type = 'Purchase Invoices'") || cleanSql.includes("type = 'Purchase Bills'")) {
              list = list.filter(t => t.type === 'Purchase Invoices' || t.type === 'Purchase Bills');
            } else if (cleanSql.includes('type = ?')) {
              list = list.filter(t => params.includes(t.type));
            }
            if (cleanSql.includes('party_name LIKE ?')) {
              const searchParam = params.find(p => String(p).startsWith('%'));
              if (searchParam) {
                const q = String(searchParam).replace(/%/g, '').toLowerCase();
                list = list.filter(t => (t.party_name && t.party_name.toLowerCase().includes(q)) || (t.txn_no && t.txn_no.toLowerCase().includes(q)));
              }
            }
            return list.sort((a, b) => b.id - a.id);
          }
          if (cleanSql.includes('FROM parties')) {
            let list = [...store.parties];
            return list.sort((a, b) => a.name.localeCompare(b.name));
          }
          if (cleanSql.includes('FROM items')) {
            let list = [...store.items];
            return list.sort((a, b) => a.name.localeCompare(b.name));
          }
          if (cleanSql.includes('FROM bank_accounts')) {
            return store.bank_accounts || [];
          }
          if (cleanSql.includes('FROM company_settings')) {
            return store.company_settings || [];
          }
          return [];
        },

        run: (...params) => {
          loadStore();
          if (cleanSql.includes('UPDATE company_settings SET is_active = 0')) {
            (store.company_settings || []).forEach(c => c.is_active = 0);
            saveStore();
            return { changes: 1 };
          }
          if (cleanSql.includes('UPDATE company_settings SET is_active = 1 WHERE id = ?')) {
            const targetId = Number(params[0]);
            (store.company_settings || []).forEach(c => {
              c.is_active = (c.id === targetId ? 1 : 0);
            });
            saveStore();
            return { changes: 1 };
          }
          if (cleanSql.includes('INSERT INTO company_settings')) {
            const newId = (store.company_settings && store.company_settings.length) 
              ? Math.max(...store.company_settings.map(c => c.id || 0)) + 1 
              : 1;
            const [
              name, phone, email, gstin, address, upi_id, tagline, terms,
              billing_address, city, state, pincode, is_gst_registered,
              business_type, industry_type, registration_type, website, is_active
            ] = params;
            const newCompany = {
              id: newId,
              name: name || 'New Business',
              phone: phone || '',
              email: email || '',
              gstin: gstin || '',
              address: address || billing_address || '',
              upi_id: upi_id || (phone ? `${phone}@upi` : ''),
              tagline: tagline || '',
              terms: terms || '1. Goods once sold will not be taken back.\n2. Subject to Samastipur jurisdiction.',
              billing_address: billing_address || address || '',
              city: city || 'SAMASTIPUR',
              state: state || 'Bihar',
              pincode: pincode || '848101',
              is_gst_registered: is_gst_registered !== undefined ? (is_gst_registered ? 1 : 0) : 1,
              business_type: business_type || 'Retailer, Wholesaler, Distributor, Manufacturer, Services',
              industry_type: industry_type || 'General Trading',
              registration_type: registration_type || 'Proprietorship',
              website: website || '',
              is_active: is_active !== undefined ? is_active : 1
            };
            if (newCompany.is_active) {
              (store.company_settings || []).forEach(c => c.is_active = 0);
            }
            if (!store.company_settings) store.company_settings = [];
            store.company_settings.push(newCompany);
            saveStore();
            return { lastInsertRowid: newId };
          }
          if (cleanSql.includes('UPDATE company_settings')) {
            let activeCompany = (store.company_settings || []).find(c => c.is_active) || (store.company_settings && store.company_settings[0]);
            if (!activeCompany) {
              activeCompany = { id: 1, name: 'VSRM COMPUTER CLASSES' };
              store.company_settings = [activeCompany];
            }
            if (typeof params[0] === 'object' && params[0] !== null) {
              Object.assign(activeCompany, params[0]);
            } else {
              const [name, phone, email, gstin, address, upi_id, tagline, terms, billing_address, city, state, pincode, is_gst_registered, business_type, industry_type, registration_type, website] = params;
              if (name !== undefined) activeCompany.name = name;
              if (phone !== undefined) activeCompany.phone = phone;
              if (email !== undefined) activeCompany.email = email;
              if (gstin !== undefined) activeCompany.gstin = gstin;
              if (address !== undefined) activeCompany.address = address;
              if (upi_id !== undefined) activeCompany.upi_id = upi_id;
              if (tagline !== undefined) activeCompany.tagline = tagline;
              if (terms !== undefined) activeCompany.terms = terms;
              if (billing_address || address) activeCompany.billing_address = billing_address || address;
              if (city !== undefined) activeCompany.city = city;
              if (state !== undefined) activeCompany.state = state;
              if (pincode !== undefined) activeCompany.pincode = pincode;
              if (is_gst_registered !== undefined) activeCompany.is_gst_registered = is_gst_registered ? 1 : 0;
              if (business_type !== undefined) activeCompany.business_type = business_type;
              if (industry_type !== undefined) activeCompany.industry_type = industry_type;
              if (registration_type !== undefined) activeCompany.registration_type = registration_type;
              if (website !== undefined) activeCompany.website = website;
            }
            saveStore();
            return { changes: 1 };
          }
          if (cleanSql.includes('INSERT INTO parties')) {
            const [name, phone, email, type, gstin, address, state, opening_balance, current_balance, city, pincode] = params;
            const newId = store.parties.length ? Math.max(...store.parties.map(p => p.id)) + 1 : 1;
            store.parties.push({ 
              id: newId, 
              name, 
              phone: phone || '', 
              email: email || '', 
              type: type || 'customer', 
              gstin: gstin || '', 
              address: address || '', 
              city: city || '', 
              state: state || 'Bihar', 
              pincode: pincode || '', 
              opening_balance: opening_balance || 0, 
              current_balance: current_balance || 0 
            });
            saveStore();
            return { lastInsertRowid: newId };
          }
          if (cleanSql.includes('INSERT INTO items')) {
            const [name, item_code, hsn_code, category, unit, sale_price, purchase_price, tax_rate, stock_qty, low_stock_limit] = params;
            const newId = store.items.length ? Math.max(...store.items.map(i => i.id)) + 1 : 1;
            store.items.push({ id: newId, name, item_code, hsn_code, category, unit, sale_price, purchase_price, tax_rate, stock_qty, low_stock_limit });
            saveStore();
            return { lastInsertRowid: newId };
          }
          if (cleanSql.includes('INSERT INTO staff')) {
            let staff_code, name, phone, role, commission_rate, password, status;
            if (cleanSql.includes('password')) {
              [staff_code, name, phone, role, commission_rate, password, status] = params;
            } else {
              [staff_code, name, phone, role, commission_rate, status] = params;
              password = '1234';
            }
            const newId = (store.staff || []).length ? Math.max(...store.staff.map(s => s.id)) + 1 : 1;
            const newStaff = {
              id: newId,
              staff_code: staff_code || `STF-${100 + newId}`,
              name,
              phone: phone || '',
              role: role || 'Sales Executive',
              commission_rate: parseFloat(commission_rate) || 0,
              password: String(password || '1234'),
              status: status || 'Active',
              created_at: new Date().toISOString().split('T')[0]
            };
            if (!store.staff) store.staff = [];
            store.staff.push(newStaff);
            saveStore();
            return { lastInsertRowid: newId };
          }
          if (cleanSql.includes('UPDATE staff SET password = ? WHERE id = ?')) {
            const [newPass, id] = params;
            const staffMember = (store.staff || []).find(s => s.id === Number(id));
            if (staffMember) {
              staffMember.password = String(newPass || '1234');
              saveStore();
              return { changes: 1 };
            }
            return { changes: 0 };
          }
          if (cleanSql.includes('UPDATE staff SET')) {
            let name, phone, role, commission_rate, password, status, id;
            if (cleanSql.includes('password = ?')) {
              [name, phone, role, commission_rate, password, status, id] = params;
            } else {
              [name, phone, role, commission_rate, status, id] = params;
            }
            const staffMember = (store.staff || []).find(s => s.id === Number(id));
            if (staffMember) {
              staffMember.name = name;
              staffMember.phone = phone || '';
              staffMember.role = role || 'Sales Executive';
              staffMember.commission_rate = parseFloat(commission_rate) || 0;
              if (password !== undefined && String(password).trim() !== '') {
                staffMember.password = String(password);
              }
              staffMember.status = status || 'Active';
              saveStore();
              return { changes: 1 };
            }
            return { changes: 0 };
          }
          if (cleanSql.includes('DELETE FROM staff WHERE id = ?')) {
            const [id] = params;
            const idx = (store.staff || []).findIndex(s => s.id === Number(id));
            if (idx !== -1) {
              store.staff.splice(idx, 1);
              saveStore();
              return { changes: 1 };
            }
            return { changes: 0 };
          }
          if (cleanSql.includes('INSERT INTO transactions')) {
            const [
              txn_no, type, date, party_id, party_name, subtotal, tax_amount, discount, 
              amount, paid_amount, balance_due, payment_type, status, notes, 
              party_phone, party_gstin, party_address, party_city, party_state, party_pincode,
              staff_id, staff_code, staff_name, staff_commission_rate, staff_commission_amount,
              salesman_id, salesman_code, salesman_name, salesman_commission_rate, salesman_commission_amount,
              accountant_id, accountant_code, accountant_name, accountant_commission_rate, accountant_commission_amount
            ] = params;
            const newId = store.transactions.length ? Math.max(...store.transactions.map(t => t.id)) + 1 : 1;
            const finalSalesmanId = salesman_id ? Number(salesman_id) : (staff_id ? Number(staff_id) : null);
            const finalSalesmanName = salesman_name || staff_name || '';
            const finalSalesmanCode = salesman_code || staff_code || '';
            const finalSalesmanRate = parseFloat(salesman_commission_rate || staff_commission_rate || 0);
            const finalSalesmanAmt = parseFloat(salesman_commission_amount || staff_commission_amount || 0);

            store.transactions.unshift({ 
              id: newId, 
              txn_no, 
              type, 
              date, 
              party_id, 
              party_name, 
              subtotal, 
              tax_amount, 
              discount, 
              amount, 
              paid_amount, 
              balance_due, 
              payment_type, 
              status, 
              notes,
              party_phone: party_phone || '',
              party_gstin: party_gstin || '',
              party_address: party_address || '',
              party_city: party_city || '',
              party_state: party_state || 'Bihar',
              party_pincode: party_pincode || '',
              // Salesman
              salesman_id: finalSalesmanId,
              salesman_code: finalSalesmanCode,
              salesman_name: finalSalesmanName,
              salesman_commission_rate: finalSalesmanRate,
              salesman_commission_amount: finalSalesmanAmt,
              // Accountant / Billed By
              accountant_id: accountant_id ? Number(accountant_id) : null,
              accountant_code: accountant_code || '',
              accountant_name: accountant_name || '',
              accountant_commission_rate: parseFloat(accountant_commission_rate || 0),
              accountant_commission_amount: parseFloat(accountant_commission_amount || 0),
              // Backward compatibility
              staff_id: finalSalesmanId,
              staff_code: finalSalesmanCode,
              staff_name: finalSalesmanName,
              staff_commission_rate: finalSalesmanRate,
              staff_commission_amount: finalSalesmanAmt
            });
            saveStore();
            return { lastInsertRowid: newId };
          }
          if (cleanSql.includes('UPDATE transactions SET staff_id = ?') || cleanSql.includes('UPDATE transactions SET salesman_id = ?')) {
            const id = params[params.length - 1];
            const staff_id = params[0];
            const staff_code = params[1];
            const staff_name = params[2];
            const staff_commission_rate = params[3];
            const txn = store.transactions.find(t => t.id === Number(id));
            if (txn) {
              const sId = staff_id ? Number(staff_id) : null;
              txn.staff_id = sId;
              txn.staff_code = staff_code || '';
              txn.staff_name = staff_name || '';
              txn.staff_commission_rate = parseFloat(staff_commission_rate) || 0;
              txn.staff_commission_amount = ((txn.amount || 0) * txn.staff_commission_rate) / 100;
              // Also update salesman fields
              txn.salesman_id = sId;
              txn.salesman_code = staff_code || '';
              txn.salesman_name = staff_name || '';
              txn.salesman_commission_rate = txn.staff_commission_rate;
              txn.salesman_commission_amount = txn.staff_commission_amount;
              saveStore();
              return { changes: 1 };
            }
            return { changes: 0 };
          }
          if (cleanSql.includes('UPDATE transactions SET accountant_id = ?')) {
            const [acc_id, acc_code, acc_name, acc_commission_rate, id] = params;
            const txn = store.transactions.find(t => t.id === Number(id));
            if (txn) {
              txn.accountant_id = acc_id ? Number(acc_id) : null;
              txn.accountant_code = acc_code || '';
              txn.accountant_name = acc_name || '';
              txn.accountant_commission_rate = parseFloat(acc_commission_rate) || 0;
              txn.accountant_commission_amount = ((txn.amount || 0) * txn.accountant_commission_rate) / 100;
              saveStore();
              return { changes: 1 };
            }
            return { changes: 0 };
          }
          if (cleanSql.includes('INSERT INTO transaction_items')) {
            const [transaction_id, item_id, item_name, hsn_code, quantity, unit, rate, discount, tax_rate, tax_amount, total] = params;
            const newId = store.transaction_items.length ? Math.max(...store.transaction_items.map(ti => ti.id)) + 1 : 1;
            store.transaction_items.push({ id: newId, transaction_id, item_id, item_name, hsn_code, quantity, unit, rate, discount, tax_rate, tax_amount, total });
            saveStore();
            return { lastInsertRowid: newId };
          }
          if (cleanSql.includes('UPDATE items SET stock_qty = stock_qty - ? WHERE id = ?')) {
            const [qty, id] = params;
            const item = store.items.find(i => i.id === Number(id));
            if (item) item.stock_qty -= Number(qty);
            saveStore();
            return { changes: 1 };
          }
          if (cleanSql.includes('UPDATE items SET stock_qty = stock_qty + ? WHERE id = ?')) {
            const [qty, id] = params;
            const item = store.items.find(i => i.id === Number(id));
            if (item) item.stock_qty += Number(qty);
            saveStore();
            return { changes: 1 };
          }
          if (cleanSql.includes('UPDATE parties SET current_balance = current_balance + ? WHERE id = ?')) {
            const [amt, id] = params;
            const party = store.parties.find(p => p.id === Number(id));
            if (party) party.current_balance += Number(amt);
            saveStore();
            return { changes: 1 };
          }
          if (cleanSql.includes('UPDATE parties SET current_balance = current_balance - ? WHERE id = ?')) {
            const [amt, id] = params;
            const party = store.parties.find(p => p.id === Number(id));
            if (party) party.current_balance -= Number(amt);
            saveStore();
            return { changes: 1 };
          }
          if (cleanSql.includes('UPDATE bank_accounts SET balance = balance + ? WHERE id = ?')) {
            const [amt, id] = params;
            const bank = store.bank_accounts.find(b => b.id === Number(id));
            if (bank) bank.balance += Number(amt);
            saveStore();
            return { changes: 1 };
          }
          if (cleanSql.includes('UPDATE bank_accounts SET balance = balance - ? WHERE id = ?')) {
            const [amt, id] = params;
            const bank = store.bank_accounts.find(b => b.id === Number(id));
            if (bank) bank.balance -= Number(amt);
            saveStore();
            return { changes: 1 };
          }
          if (cleanSql.includes('DELETE FROM items WHERE id = ?')) {
            const [id] = params;
            const idx = store.items.findIndex(i => i.id === Number(id));
            if (idx !== -1) {
              store.items.splice(idx, 1);
              saveStore();
              return { changes: 1 };
            }
            return { changes: 0 };
          }
          if (cleanSql.includes('UPDATE items SET stock_qty = ? WHERE id = ?')) {
            const [qty, id] = params;
            const item = store.items.find(i => i.id === Number(id));
            if (item) {
              item.stock_qty = Number(qty);
              saveStore();
              return { changes: 1 };
            }
            return { changes: 0 };
          }
          if (cleanSql.startsWith('UPDATE items SET name = ?')) {
            const [name, item_code, hsn_code, category, unit, sale_price, purchase_price, tax_rate, stock_qty, low_stock_limit, id] = params;
            const item = store.items.find(i => i.id === Number(id));
            if (item) {
              Object.assign(item, { name, item_code, hsn_code, category, unit, sale_price: Number(sale_price), purchase_price: Number(purchase_price), tax_rate: Number(tax_rate), stock_qty: Number(stock_qty), low_stock_limit: Number(low_stock_limit) });
              saveStore();
              return { changes: 1 };
            }
            return { changes: 0 };
          }
          return { changes: 0 };
        }
      };
    }
  };
}

module.exports = db;
