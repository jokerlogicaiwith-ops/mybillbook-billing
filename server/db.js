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
  `);

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
            return store.company_settings[0] || {};
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
          return [];
        },

        run: (...params) => {
          loadStore();
          if (cleanSql.includes('UPDATE company_settings')) {
            const [name, phone, email, gstin, address, upi_id, tagline, terms] = params;
            store.company_settings[0] = { ...store.company_settings[0], name, phone, email, gstin, address, upi_id, tagline, terms };
            saveStore();
            return { changes: 1 };
          }
          if (cleanSql.includes('INSERT INTO parties')) {
            const [name, phone, email, type, gstin, address, state, opening_balance, current_balance] = params;
            const newId = store.parties.length ? Math.max(...store.parties.map(p => p.id)) + 1 : 1;
            store.parties.push({ id: newId, name, phone, email, type, gstin, address, state, opening_balance, current_balance });
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
          if (cleanSql.includes('INSERT INTO transactions')) {
            const [txn_no, type, date, party_id, party_name, subtotal, tax_amount, discount, amount, paid_amount, balance_due, payment_type, status, notes] = params;
            const newId = store.transactions.length ? Math.max(...store.transactions.map(t => t.id)) + 1 : 1;
            store.transactions.unshift({ id: newId, txn_no, type, date, party_id, party_name, subtotal, tax_amount, discount, amount, paid_amount, balance_due, payment_type, status, notes });
            saveStore();
            return { lastInsertRowid: newId };
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
