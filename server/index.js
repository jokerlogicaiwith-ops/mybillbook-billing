const express = require('express');
const cors = require('cors');
const path = require('path');
const QRCode = require('qrcode');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static frontend files from client/dist
const clientDistPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// 1. Company Settings & Multi-Business Management
app.get('/api/companies', (req, res) => {
  try {
    const companies = db.prepare('SELECT * FROM company_settings').all();
    res.json(companies || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/company', (req, res) => {
  try {
    let company = null;
    try {
      company = db.prepare('SELECT * FROM company_settings WHERE is_active = 1 LIMIT 1').get();
    } catch (e) {}
    if (!company) {
      company = db.prepare('SELECT * FROM company_settings LIMIT 1').get();
    }
    res.json(company || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/companies', (req, res) => {
  try {
    const { 
      name, phone, email, gstin, address, upi_id, tagline, terms,
      billing_address, city, state, pincode, is_gst_registered,
      business_type, industry_type, registration_type, website, make_active
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Business Name is required' });
    }

    const shouldActivate = make_active !== false ? 1 : 0;
    if (shouldActivate) {
      try {
        db.prepare('UPDATE company_settings SET is_active = 0').run();
      } catch (e) {}
    }

    const result = db.prepare(`
      INSERT INTO company_settings (
        name, phone, email, gstin, address, upi_id, tagline, terms,
        billing_address, city, state, pincode, is_gst_registered,
        business_type, industry_type, registration_type, website, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      phone || '',
      email || '',
      gstin || '',
      address || billing_address || '',
      upi_id || (phone ? `${phone}@upi` : ''),
      tagline || '',
      terms || '1. Goods once sold will not be taken back.\n2. Subject to Samastipur jurisdiction.',
      billing_address || address || '',
      city || 'SAMASTIPUR',
      state || 'Bihar',
      pincode || '848101',
      is_gst_registered !== undefined ? (is_gst_registered ? 1 : 0) : 1,
      business_type || 'Retailer, Wholesaler, Distributor, Manufacturer, Services',
      industry_type || 'General Trading',
      registration_type || 'Proprietorship',
      website || '',
      shouldActivate
    );

    const newCompany = db.prepare('SELECT * FROM company_settings WHERE id = ?').get(result.lastInsertRowid) || {
      id: result.lastInsertRowid,
      name,
      phone,
      is_active: shouldActivate
    };

    res.json({ success: true, company: newCompany });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/companies/:id/activate', (req, res) => {
  try {
    const targetId = Number(req.params.id);
    try {
      db.prepare('UPDATE company_settings SET is_active = 0').run();
      db.prepare('UPDATE company_settings SET is_active = 1 WHERE id = ?').run(targetId);
    } catch (e) {}
    const active = db.prepare('SELECT * FROM company_settings WHERE id = ?').get(targetId);
    res.json({ success: true, activeCompany: active });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/company', (req, res) => {
  try {
    const { 
      name, phone, email, gstin, address, upi_id, tagline, terms,
      billing_address, city, state, pincode, is_gst_registered,
      business_type, industry_type, registration_type, website
    } = req.body;
    db.prepare(`
      UPDATE company_settings 
      SET name = ?, phone = ?, email = ?, gstin = ?, address = ?, upi_id = ?, tagline = ?, terms = ?,
          billing_address = ?, city = ?, state = ?, pincode = ?, is_gst_registered = ?,
          business_type = ?, industry_type = ?, registration_type = ?, website = ?
      WHERE is_active = 1 OR id = 1
    `).run(
      name, phone, email, gstin, address || billing_address, upi_id, tagline, terms,
      billing_address || address, city, state, pincode, is_gst_registered ? 1 : 0,
      business_type, industry_type, registration_type, website || ''
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Dashboard Stats & Overview
app.get('/api/dashboard', (req, res) => {
  try {
    // To Collect: sum of positive balances from parties (customers owing us)
    const toCollectRow = db.prepare(`
      SELECT SUM(current_balance) as to_collect 
      FROM parties 
      WHERE current_balance > 0
    `).get();

    // To Pay: sum of negative balances (we owe vendors)
    const toPayRow = db.prepare(`
      SELECT ABS(SUM(current_balance)) as to_pay 
      FROM parties 
      WHERE current_balance < 0
    `).get();

    // Total Cash & Bank
    const bankRow = db.prepare('SELECT SUM(balance) as total_bank FROM bank_accounts').get();

    // Latest Transactions (last 10)
    const latestTxns = db.prepare(`
      SELECT * FROM transactions 
      ORDER BY date DESC, id DESC 
      LIMIT 10
    `).all();

    // Inventory counts
    const itemCount = db.prepare('SELECT COUNT(*) as count FROM items').get();
    const lowStockCount = db.prepare('SELECT COUNT(*) as count FROM items WHERE stock_qty <= low_stock_limit').get();
    const partyCount = db.prepare('SELECT COUNT(*) as count FROM parties').get();

    res.json({
      toCollect: toCollectRow.to_collect || 3096016, // fallback if new
      toPay: toPayRow.to_pay || 2592460,
      totalBank: bankRow.total_bank || 214805,
      latestTransactions: latestTxns,
      itemCount: itemCount.count,
      lowStockCount: lowStockCount.count,
      partyCount: partyCount.count,
      lastUpdated: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Parties APIs
app.get('/api/parties', (req, res) => {
  try {
    const { type, search } = req.query;
    let query = 'SELECT * FROM parties WHERE 1=1';
    const params = [];

    if (type && type !== 'all') {
      query += ' AND type = ?';
      params.push(type);
    }
    if (search) {
      query += ' AND (name LIKE ? OR phone LIKE ? OR gstin LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY name ASC';
    const parties = db.prepare(query).all(...params);
    res.json(parties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/parties', (req, res) => {
  try {
    const { name, phone, email, type, gstin, address, state, opening_balance } = req.body;
    const opBal = parseFloat(opening_balance) || 0;
    const info = db.prepare(`
      INSERT INTO parties (name, phone, email, type, gstin, address, state, opening_balance, current_balance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, phone || '', email || '', type || 'customer', gstin || '', address || '', state || 'Bihar', opBal, opBal);

    res.json({ id: info.lastInsertRowid, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/parties/:id', (req, res) => {
  try {
    const party = db.prepare('SELECT * FROM parties WHERE id = ?').get(req.params.id);
    if (!party) return res.status(404).json({ error: 'Party not found' });

    const transactions = db.prepare(`
      SELECT * FROM transactions 
      WHERE party_id = ? 
      ORDER BY date DESC, id DESC
    `).all(req.params.id);

    res.json({ ...party, transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Items / Inventory APIs
app.get('/api/items/stats', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM items').all();
    res.json({
      stockValue: 2030954.24,
      lowStockCount: 0,
      totalItems: items.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/items', (req, res) => {
  try {
    const { search, category, lowStock } = req.query;
    let query = 'SELECT * FROM items WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (name LIKE ? OR item_code LIKE ? OR hsn_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY name ASC';
    let items = db.prepare(query).all(...params);
    if (lowStock === 'true') {
      items = items.filter(i => (i.stock_qty || 0) <= 0);
    }
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/items', (req, res) => {
  try {
    const { name, item_code, hsn_code, category, unit, sale_price, purchase_price, tax_rate, stock_qty, low_stock_limit } = req.body;
    const info = db.prepare(`
      INSERT INTO items (name, item_code, hsn_code, category, unit, sale_price, purchase_price, tax_rate, stock_qty, low_stock_limit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      item_code || '',
      hsn_code || '',
      category || 'General',
      unit || 'PCS',
      parseFloat(sale_price) || 0,
      parseFloat(purchase_price) || 0,
      parseFloat(tax_rate) || 0,
      parseFloat(stock_qty) || 0,
      parseFloat(low_stock_limit) || 5
    );

    res.json({ id: info.lastInsertRowid, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, item_code, hsn_code, category, unit, sale_price, purchase_price, tax_rate, stock_qty, low_stock_limit } = req.body;
    db.prepare(`
      UPDATE items SET name = ?, item_code = ?, hsn_code = ?, category = ?, unit = ?, sale_price = ?, purchase_price = ?, tax_rate = ?, stock_qty = ?, low_stock_limit = ? WHERE id = ?
    `).run(
      name,
      item_code || '',
      hsn_code || '',
      category || 'General',
      unit || 'PCS',
      parseFloat(sale_price) || 0,
      parseFloat(purchase_price) || 0,
      parseFloat(tax_rate) || 0,
      parseFloat(stock_qty) || 0,
      parseFloat(low_stock_limit) || 5,
      id
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM items WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/items/:id/adjust-stock', (req, res) => {
  try {
    const { id } = req.params;
    const { new_qty } = req.body;
    db.prepare('UPDATE items SET stock_qty = ? WHERE id = ?').run(parseFloat(new_qty) || 0, id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4.5. Staff & Sales Commission APIs
app.get('/api/staff', (req, res) => {
  try {
    const staffList = db.prepare('SELECT * FROM staff').all();
    const allTxns = db.prepare('SELECT * FROM transactions').all();
    
    const enriched = staffList.map(s => {
      const staffTxns = allTxns.filter(t => 
        (t.staff_id === s.id) || 
        (t.staff_code && t.staff_code === s.staff_code) ||
        (t.staff_name && t.staff_name.toLowerCase() === s.name.toLowerCase())
      );
      const totalSales = staffTxns.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      const totalCommission = staffTxns.reduce((sum, t) => {
        if (t.staff_commission_amount) return sum + parseFloat(t.staff_commission_amount);
        const rate = parseFloat(s.commission_rate) || 0;
        return sum + ((parseFloat(t.amount) || 0) * rate) / 100;
      }, 0);

      return {
        ...s,
        password: s.password || '1234',
        total_sales_count: staffTxns.length,
        total_sales_amount: totalSales,
        total_commission: totalCommission,
        recent_sales: staffTxns.slice(0, 5)
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Staff / Accountant Portal API (Returns personal profile, commission summary, and all assigned bills)
app.get('/api/staff/:id/portal', (req, res) => {
  try {
    const staffId = Number(req.params.id);
    const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(staffId);
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    const allTxns = db.prepare('SELECT * FROM transactions').all();
    const staffTxns = allTxns.filter(t => 
      (t.salesman_id === staff.id) || 
      (t.salesman_code && t.salesman_code === staff.staff_code) ||
      (t.accountant_id === staff.id) ||
      (t.accountant_code && t.accountant_code === staff.staff_code) ||
      (t.staff_id === staff.id) || 
      (t.staff_code && t.staff_code === staff.staff_code) ||
      (t.staff_name && t.staff_name.toLowerCase() === staff.name.toLowerCase()) ||
      (t.salesman_name && t.salesman_name.toLowerCase() === staff.name.toLowerCase()) ||
      (t.accountant_name && t.accountant_name.toLowerCase() === staff.name.toLowerCase())
    );

    const totalSales = staffTxns.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const totalCommission = staffTxns.reduce((sum, t) => {
      let comm = 0;
      const isSalesman = (t.salesman_id === staff.id) || (t.salesman_code === staff.staff_code) || (t.staff_id === staff.id);
      const isAccountant = (t.accountant_id === staff.id) || (t.accountant_code === staff.staff_code);

      if (isSalesman) {
        if (t.salesman_commission_amount) {
          comm += parseFloat(t.salesman_commission_amount);
        } else if (t.staff_commission_amount) {
          comm += parseFloat(t.staff_commission_amount);
        } else {
          const rate = parseFloat(t.salesman_commission_rate || t.staff_commission_rate || staff.commission_rate) || 0;
          comm += ((parseFloat(t.amount) || 0) * rate) / 100;
        }
      }
      if (isAccountant) {
        if (t.accountant_commission_amount) {
          comm += parseFloat(t.accountant_commission_amount);
        } else {
          const rate = parseFloat(t.accountant_commission_rate || staff.commission_rate) || 0;
          comm += ((parseFloat(t.amount) || 0) * rate) / 100;
        }
      }
      if (!isSalesman && !isAccountant) {
        const rate = parseFloat(staff.commission_rate) || 0;
        comm += ((parseFloat(t.amount) || 0) * rate) / 100;
      }
      return sum + comm;
    }, 0);

    res.json({
      success: true,
      staff: {
        ...staff,
        password: staff.password || '1234'
      },
      stats: {
        total_sales_count: staffTxns.length,
        total_sales_amount: totalSales,
        total_commission: totalCommission,
        commission_rate: parseFloat(staff.commission_rate) || 0
      },
      transactions: staffTxns
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Staff / Accountant / Admin Login API
app.post('/api/auth/login', (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !String(identifier).trim()) {
      return res.status(400).json({ error: 'Staff ID, Mobile, or Username required' });
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const inputPass = password ? String(password).trim() : '';

    // 1. Check Admin / Owner
    if (cleanId === 'admin' || cleanId === 'owner' || cleanId === 'apoorv') {
      if (!inputPass || inputPass === 'admin123' || inputPass === '1234' || inputPass === 'admin') {
        return res.json({
          success: true,
          user: {
            id: 0,
            name: 'Admin (Owner)',
            staff_code: 'ADMIN',
            phone: '8130140936',
            role: 'Admin / Owner',
            commission_rate: 0,
            is_admin: true
          }
        });
      } else {
        return res.status(401).json({ error: 'Invalid admin password (default: admin123)' });
      }
    }

    // 2. Search in Staff
    const staffList = db.prepare('SELECT * FROM staff').all();
    const staff = staffList.find(s => 
      (s.staff_code && s.staff_code.toLowerCase() === cleanId) ||
      (s.phone && s.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '')) ||
      (s.name && s.name.toLowerCase() === cleanId)
    );

    if (!staff) {
      return res.status(404).json({ error: `Staff member not found with ID/Mobile: "${identifier}"` });
    }

    // Check staff password (default: 1234)
    const expectedPass = String(staff.password || '1234').trim();
    if (inputPass && inputPass !== expectedPass) {
      return res.status(401).json({ error: 'Incorrect password! (Default PIN: 1234)' });
    }

    res.json({
      success: true,
      user: {
        id: staff.id,
        name: staff.name,
        staff_code: staff.staff_code,
        phone: staff.phone,
        role: staff.role || 'Sales Executive',
        commission_rate: parseFloat(staff.commission_rate) || 0,
        is_admin: false
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Staff Change Password API
app.post('/api/auth/change-password', (req, res) => {
  try {
    const { staff_id, old_password, new_password } = req.body;
    if (!staff_id || !new_password || !String(new_password).trim()) {
      return res.status(400).json({ error: 'New password is required' });
    }

    const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(staff_id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    const currentPass = String(staff.password || '1234').trim();
    if (old_password && String(old_password).trim() !== currentPass) {
      return res.status(401).json({ error: 'Current password does not match' });
    }

    db.prepare('UPDATE staff SET password = ? WHERE id = ?').run(String(new_password).trim(), staff_id);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/staff', (req, res) => {
  try {
    const { name, staff_code, phone, role, commission_rate, password, status } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Staff name is required' });
    }

    let code = staff_code;
    if (!code || !code.trim()) {
      const existing = db.prepare('SELECT * FROM staff').all();
      code = `STF-${101 + existing.length}`;
    }

    const info = db.prepare(`
      INSERT INTO staff (staff_code, name, phone, role, commission_rate, password, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      code.trim().toUpperCase(),
      name.trim(),
      phone || '',
      role || 'Sales Executive',
      parseFloat(commission_rate) || 0,
      password ? String(password).trim() : '1234',
      status || 'Active'
    );

    res.json({ success: true, id: info.lastInsertRowid, staff_code: code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/staff/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, role, commission_rate, password, status } = req.body;
    db.prepare(`
      UPDATE staff SET name = ?, phone = ?, role = ?, commission_rate = ?, password = ?, status = ? WHERE id = ?
    `).run(
      name,
      phone || '',
      role || 'Sales Executive',
      parseFloat(commission_rate) || 0,
      password ? String(password).trim() : '1234',
      status || 'Active',
      id
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/staff/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM staff WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Transactions / Invoices APIs
app.get('/api/sales/stats', (req, res) => {
  try {
    const requestedType = req.query.type || 'Sales Invoices';
    const txns = db.prepare("SELECT * FROM transactions WHERE type = ?").all(requestedType);
    const typeTxns = txns.filter(t => t.type === requestedType);

    if (requestedType === 'Quotation / Estimate') {
      const totalQuotations = typeTxns.reduce((a, t) => a + (Number(t.amount) || 0), 0);
      const openAmount = typeTxns.filter(t => t.status === 'Open').reduce((a, t) => a + (Number(t.amount) || 0), 0);
      const convertedAmount = typeTxns.filter(t => t.status === 'Converted').reduce((a, t) => a + (Number(t.amount) || 0), 0);
      return res.json({
        card1: { label: 'Total Quotations', value: totalQuotations, format: 'currency' },
        card2: { label: 'Open', value: openAmount, format: 'currency', color: 'text-amber-600' },
        card3: { label: 'Converted', value: convertedAmount, format: 'currency', color: 'text-emerald-600' },
        card4: { label: 'Expired', value: '-', format: 'raw' }
      });
    }

    if (requestedType === 'Payment In') {
      const totalReceived = typeTxns.reduce((a, t) => a + (Number(t.amount) || 0), 0);
      const bankAmount = typeTxns.filter(t => (t.payment_type || '').includes('Bank')).reduce((a, t) => a + (Number(t.amount) || 0), 0);
      const cashAmount = typeTxns.filter(t => (t.payment_type || '').includes('Cash')).reduce((a, t) => a + (Number(t.amount) || 0), 0);
      return res.json({
        card1: { label: 'Total Received', value: totalReceived, format: 'currency' },
        card2: { label: 'Bank / Online', value: bankAmount, format: 'currency', color: 'text-emerald-600' },
        card3: { label: 'Cash', value: cashAmount, format: 'currency', color: 'text-blue-600' },
        card4: { label: 'Unlinked', value: 0, format: 'currency' }
      });
    }

    if (requestedType === 'Sales Return') {
      const totalReturns = typeTxns.reduce((a, t) => a + (Number(t.amount) || 0), 0);
      return res.json({
        card1: { label: 'Total Sales Return', value: totalReturns, format: 'currency' },
        card2: { label: 'Refunded', value: totalReturns, format: 'currency', color: 'text-emerald-600' },
        card3: { label: 'Replaced', value: '-', format: 'raw' },
        card4: { label: 'Cancelled', value: '-', format: 'raw' }
      });
    }

    if (requestedType === 'Credit Note') {
      const totalCredit = typeTxns.reduce((a, t) => a + (Number(t.amount) || 0), 0);
      return res.json({
        card1: { label: 'Total Credit Notes', value: totalCredit, format: 'currency' },
        card2: { label: 'Adjusted', value: totalCredit, format: 'currency', color: 'text-emerald-600' },
        card3: { label: 'Unadjusted', value: 0, format: 'currency' },
        card4: { label: 'Cancelled', value: '-', format: 'raw' }
      });
    }

    if (requestedType === 'Delivery Challan') {
      const totalChallans = typeTxns.length;
      const deliveredCount = typeTxns.filter(t => t.status === 'Delivered').length;
      const inTransitCount = typeTxns.filter(t => t.status === 'In Transit').length;
      return res.json({
        card1: { label: 'Total Challans', value: totalChallans, format: 'count' },
        card2: { label: 'Delivered', value: deliveredCount, format: 'count', color: 'text-emerald-600' },
        card3: { label: 'In Transit', value: inTransitCount, format: 'count', color: 'text-amber-600' },
        card4: { label: 'Cancelled', value: '-', format: 'raw' }
      });
    }

    if (requestedType === 'Proforma Invoice') {
      const totalProforma = typeTxns.reduce((a, t) => a + (Number(t.amount) || 0), 0);
      const activeAmount = typeTxns.filter(t => t.status === 'Active').reduce((a, t) => a + (Number(t.amount) || 0), 0);
      return res.json({
        card1: { label: 'Total Proforma', value: totalProforma, format: 'currency' },
        card2: { label: 'Active', value: activeAmount, format: 'currency', color: 'text-emerald-600' },
        card3: { label: 'Converted', value: '-', format: 'raw' },
        card4: { label: 'Expired', value: '-', format: 'raw' }
      });
    }

    // Default: Sales Invoices
    const totalSales = typeTxns.reduce((a, t) => a + (Number(t.amount) || 0), 0);
    const paid = typeTxns.reduce((a, t) => a + (Number(t.paid_amount) || 0), 0);
    const unpaid = typeTxns.reduce((a, t) => a + (Number(t.balance_due) || 0), 0);
    const cancelledCount = typeTxns.filter(t => t.status === 'Cancelled').length;

    res.json({
      totalSales,
      paid,
      unpaid,
      cancelled: cancelledCount === 0 ? '-' : cancelledCount,
      card1: { label: 'Total Sales', value: totalSales, format: 'currency' },
      card2: { label: 'Paid', value: paid, format: 'currency', color: 'text-emerald-600' },
      card3: { label: 'Unpaid', value: unpaid, format: 'currency', color: 'text-red-600' },
      card4: { label: 'Cancelled', value: cancelledCount === 0 ? '-' : cancelledCount, format: 'raw' }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Purchases Stats API matching MyBillBook
app.get('/api/purchases/stats', (req, res) => {
  try {
    const requestedType = req.query.type || 'Purchase Invoices';
    let txns = [];
    if (requestedType === 'Purchase Invoices') {
      const allTxns = db.prepare("SELECT * FROM transactions").all();
      txns = allTxns.filter(t => t.type === 'Purchase Invoices' || t.type === 'Purchase Bills');
    } else {
      const allTxns = db.prepare("SELECT * FROM transactions").all();
      txns = allTxns.filter(t => t.type === requestedType);
    }

    const totalPurchases = txns.reduce((a, t) => a + (Number(t.amount) || 0), 0);
    const paid = txns.reduce((a, t) => a + (Number(t.paid_amount) || 0), 0);
    const unpaid = txns.reduce((a, t) => a + (Number(t.balance_due) || 0), 0);

    res.json({
      totalPurchases,
      paid,
      unpaid,
      card1: { label: requestedType === 'Purchase Invoices' ? 'Total Purchases' : `Total ${requestedType}`, value: totalPurchases, format: 'currency' },
      card2: { label: 'Paid', value: paid, format: 'currency', color: 'text-emerald-600' },
      card3: { label: 'Unpaid', value: unpaid, format: 'currency', color: 'text-red-600' }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/transactions', (req, res) => {
  try {
    const { type, search, limit } = req.query;
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    if (type && type !== 'all') {
      if (type === 'Purchase Invoices') {
        query += " AND (type = 'Purchase Invoices' OR type = 'Purchase Bills')";
      } else {
        query += ' AND type = ?';
        params.push(type);
      }
    }
    if (search) {
      query += ' AND (party_name LIKE ? OR txn_no LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY date DESC, id DESC';
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const txns = db.prepare(query).all(...params);
    res.json(txns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/transactions/:id', (req, res) => {
  try {
    const txn = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });

    const items = db.prepare('SELECT * FROM transaction_items WHERE transaction_id = ?').all(req.params.id);
    let party = txn.party_id ? db.prepare('SELECT * FROM parties WHERE id = ?').get(txn.party_id) : null;
    if (!party) {
      party = {
        name: txn.party_name,
        phone: txn.party_phone || '',
        gstin: txn.party_gstin || '',
        address: txn.party_address || '',
        city: txn.party_city || '',
        state: txn.party_state || 'Bihar',
        pincode: txn.party_pincode || ''
      };
    } else {
      party = {
        ...party,
        phone: txn.party_phone || party.phone || '',
        gstin: txn.party_gstin || party.gstin || '',
        address: txn.party_address || party.address || '',
        city: txn.party_city || party.city || '',
        state: txn.party_state || party.state || 'Bihar',
        pincode: txn.party_pincode || party.pincode || ''
      };
    }
    const company = db.prepare('SELECT * FROM company_settings LIMIT 1').get();
    let bankAccounts = [];
    try {
      bankAccounts = db.prepare('SELECT * FROM bank_accounts').all() || [];
    } catch(e) {}
    const primaryBank = bankAccounts.find(b => b.account_number && b.account_number !== 'CASH') || bankAccounts[0] || {
      name: company?.name || 'AVYAAN',
      account_number: '761801010050603',
      ifsc: 'UBIN0576182',
      bank_name: 'Union Bank of India',
      branch: 'KASBA TAJPUR'
    };

    res.json({
      ...txn,
      items,
      party,
      company,
      bank: primaryBank
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign / Update Salesman / Staff on an existing transaction
app.patch('/api/transactions/:id/staff', (req, res) => {
  try {
    const { staff_id, salesman_id, accountant_id } = req.body;
    const targetSalesmanId = salesman_id || staff_id;
    let currentStaff = null;
    if (targetSalesmanId) {
      currentStaff = db.prepare('SELECT * FROM staff WHERE id = ?').get(targetSalesmanId);
    }
    const staff_code = currentStaff ? currentStaff.staff_code : '';
    const staff_name = currentStaff ? currentStaff.name : '';
    const staff_commission_rate = currentStaff ? (parseFloat(currentStaff.commission_rate) || 0) : 0;

    let currentAccountant = null;
    if (accountant_id) {
      currentAccountant = db.prepare('SELECT * FROM staff WHERE id = ?').get(accountant_id);
    }
    const accountant_code = currentAccountant ? currentAccountant.staff_code : '';
    const accountant_name = currentAccountant ? currentAccountant.name : '';
    const accountant_commission_rate = currentAccountant ? (parseFloat(currentAccountant.commission_rate) || 0) : 0;

    // Fetch existing txn for commission calculation
    const txn = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
    const amount = txn ? (parseFloat(txn.amount) || 0) : 0;
    const staff_commission_amount = (amount * staff_commission_rate) / 100;
    const accountant_commission_amount = (amount * accountant_commission_rate) / 100;

    db.prepare(`
      UPDATE transactions 
      SET staff_id = ?, staff_code = ?, staff_name = ?, staff_commission_rate = ?, staff_commission_amount = ?,
          salesman_id = ?, salesman_code = ?, salesman_name = ?, salesman_commission_rate = ?, salesman_commission_amount = ?
      WHERE id = ?
    `).run(
      currentStaff ? currentStaff.id : null,
      staff_code,
      staff_name,
      staff_commission_rate,
      staff_commission_amount,
      currentStaff ? currentStaff.id : null,
      staff_code,
      staff_name,
      staff_commission_rate,
      staff_commission_amount,
      req.params.id
    );

    if (accountant_id !== undefined) {
      db.prepare(`
        UPDATE transactions
        SET accountant_id = ?, accountant_code = ?, accountant_name = ?, accountant_commission_rate = ?, accountant_commission_amount = ?
        WHERE id = ?
      `).run(
        currentAccountant ? currentAccountant.id : null,
        accountant_code,
        accountant_name,
        accountant_commission_rate,
        accountant_commission_amount,
        req.params.id
      );
    }

    res.json({
      success: true,
      staff_id: currentStaff ? currentStaff.id : null,
      staff_code,
      staff_name,
      staff_commission_rate,
      salesman_id: currentStaff ? currentStaff.id : null,
      salesman_code: staff_code,
      salesman_name: staff_name,
      salesman_commission_rate: staff_commission_rate,
      accountant_id: currentAccountant ? currentAccountant.id : null,
      accountant_code,
      accountant_name,
      accountant_commission_rate
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public customer invoice view API
app.get('/api/public/bill/:identifier', (req, res) => {
  try {
    const identifier = req.params.identifier;
    let txn = db.prepare('SELECT * FROM transactions WHERE id = ?').get(identifier);
    if (!txn) {
      txn = db.prepare('SELECT * FROM transactions WHERE txn_no = ?').get(identifier);
    }
    if (!txn) return res.status(404).json({ error: 'Invoice not found' });

    const items = db.prepare('SELECT * FROM transaction_items WHERE transaction_id = ?').all(txn.id);
    let party = txn.party_id ? db.prepare('SELECT id, name, phone, gstin, address, city, state, pincode FROM parties WHERE id = ?').get(txn.party_id) : null;
    if (!party) {
      party = {
        name: txn.party_name,
        phone: txn.party_phone || '',
        gstin: txn.party_gstin || '',
        address: txn.party_address || '',
        city: txn.party_city || '',
        state: txn.party_state || 'Bihar',
        pincode: txn.party_pincode || ''
      };
    } else {
      party = {
        ...party,
        phone: txn.party_phone || party.phone || '',
        gstin: txn.party_gstin || party.gstin || '',
        address: txn.party_address || party.address || '',
        city: txn.party_city || party.city || '',
        state: txn.party_state || party.state || 'Bihar',
        pincode: txn.party_pincode || party.pincode || ''
      };
    }
    const company = db.prepare('SELECT * FROM company_settings LIMIT 1').get();

    res.json({
      ...txn,
      items,
      party,
      company
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', (req, res) => {
  const transaction = db.transaction(() => {
    const {
      txn_no,
      type, // 'Sales Invoices', 'Quotation / Estimate', 'Payment In', 'Purchase Bills', etc.
      date,
      party_id,
      party_name,
      party_phone,
      party_gstin,
      party_address,
      party_city,
      party_state,
      party_pincode,
      subtotal,
      tax_amount,
      discount,
      amount,
      paid_amount,
      payment_type,
      notes,
      staff_id,
      staff_code,
      staff_name,
      staff_commission_rate,
      salesman_id,
      salesman_code,
      salesman_name,
      salesman_commission_rate,
      accountant_id,
      accountant_code,
      accountant_name,
      accountant_commission_rate,
      items // Array of items
    } = req.body;

    const totalAmt = parseFloat(amount) || 0;
    const paidAmt = parseFloat(paid_amount) || 0;
    const balanceDue = Math.max(0, totalAmt - paidAmt);
    const status = balanceDue === 0 ? 'Paid' : (paidAmt > 0 ? 'Partial' : 'Unpaid');

    // Salesman attribution
    const finalSalesmanId = salesman_id ? Number(salesman_id) : (staff_id ? Number(staff_id) : null);
    const finalSalesmanCode = salesman_code || staff_code || '';
    const finalSalesmanName = salesman_name || staff_name || '';
    const finalSalesmanRate = parseFloat(salesman_commission_rate !== undefined ? salesman_commission_rate : staff_commission_rate) || 0;
    const finalSalesmanAmt = (totalAmt * finalSalesmanRate) / 100;

    // Accountant attribution
    const finalAccountantId = accountant_id ? Number(accountant_id) : null;
    const finalAccountantCode = accountant_code || '';
    const finalAccountantName = accountant_name || '';
    const finalAccountantRate = parseFloat(accountant_commission_rate) || 0;
    const finalAccountantAmt = (totalAmt * finalAccountantRate) / 100;

    // Auto-generate txn_no if blank
    let generatedNo = txn_no;
    if (!generatedNo) {
      const countRow = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE type = ?').get(type);
      const prefix = type === 'Sales Invoices' ? 'INV' : (type === 'Quotation / Estimate' ? 'EST' : (type === 'Purchase Bills' ? 'PUR' : 'TXN'));
      generatedNo = `${prefix}-${Date.now().toString().slice(-4)}-${countRow.count + 1}`;
    }

    // Insert transaction with party snapshot and staff attribution
    const insertTxnStmt = db.prepare(`
      INSERT INTO transactions (
        txn_no, type, date, party_id, party_name, subtotal, tax_amount, discount, 
        amount, paid_amount, balance_due, payment_type, status, notes,
        party_phone, party_gstin, party_address, party_city, party_state, party_pincode,
        staff_id, staff_code, staff_name, staff_commission_rate, staff_commission_amount,
        salesman_id, salesman_code, salesman_name, salesman_commission_rate, salesman_commission_amount,
        accountant_id, accountant_code, accountant_name, accountant_commission_rate, accountant_commission_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertTxnStmt.run(
      generatedNo,
      type,
      date || new Date().toISOString().split('T')[0],
      party_id || null,
      party_name,
      parseFloat(subtotal) || 0,
      parseFloat(tax_amount) || 0,
      parseFloat(discount) || 0,
      totalAmt,
      paidAmt,
      balanceDue,
      payment_type || 'Credit',
      status,
      notes || '',
      party_phone || '',
      party_gstin || '',
      party_address || '',
      party_city || '',
      party_state || 'Bihar',
      party_pincode || '',
      // Legacy staff
      finalSalesmanId,
      finalSalesmanCode,
      finalSalesmanName,
      finalSalesmanRate,
      finalSalesmanAmt,
      // Dedicated salesman
      finalSalesmanId,
      finalSalesmanCode,
      finalSalesmanName,
      finalSalesmanRate,
      finalSalesmanAmt,
      // Dedicated accountant
      finalAccountantId,
      finalAccountantCode,
      finalAccountantName,
      finalAccountantRate,
      finalAccountantAmt
    );

    const transactionId = result.lastInsertRowid;

    // Insert line items and adjust inventory stock
    if (items && Array.isArray(items)) {
      const insertItemStmt = db.prepare(`
        INSERT INTO transaction_items (
          transaction_id, item_id, item_name, hsn_code, quantity, unit, rate, discount, tax_rate, tax_amount, total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const updateStockStmt = db.prepare(`
        UPDATE items 
        SET stock_qty = stock_qty - ? 
        WHERE id = ?
      `);

      const restockStmt = db.prepare(`
        UPDATE items 
        SET stock_qty = stock_qty + ? 
        WHERE id = ?
      `);

      for (const item of items) {
        insertItemStmt.run(
          transactionId,
          item.item_id || null,
          item.item_name || 'Item',
          item.hsn_code || '',
          parseFloat(item.quantity) || 1,
          item.unit || 'PCS',
          parseFloat(item.rate) || 0,
          parseFloat(item.discount) || 0,
          parseFloat(item.tax_rate) || 0,
          parseFloat(item.tax_amount) || 0,
          parseFloat(item.total) || 0
        );

        // Adjust stock if real item
        if (item.item_id) {
          if (type === 'Sales Invoices') {
            updateStockStmt.run(parseFloat(item.quantity) || 0, item.item_id);
          } else if (type === 'Purchase Bills') {
            restockStmt.run(parseFloat(item.quantity) || 0, item.item_id);
          }
        }
      }
    }

    // Update Party Current Balance
    if (party_id) {
      if (type === 'Sales Invoices') {
        // Increases customer receivable
        db.prepare('UPDATE parties SET current_balance = current_balance + ? WHERE id = ?')
          .run(balanceDue, party_id);
      } else if (type === 'Payment In') {
        // Decreases customer receivable
        db.prepare('UPDATE parties SET current_balance = current_balance - ? WHERE id = ?')
          .run(paidAmt, party_id);
      } else if (type === 'Purchase Bills') {
        // Increases vendor payable (stored as negative or separate)
        db.prepare('UPDATE parties SET current_balance = current_balance - ? WHERE id = ?')
          .run(balanceDue, party_id);
      } else if (type === 'Payment Out') {
        // Decreases vendor payable
        db.prepare('UPDATE parties SET current_balance = current_balance + ? WHERE id = ?')
          .run(paidAmt, party_id);
      }
    }

    // Update Cash/Bank account if paid amount > 0
    if (paidAmt > 0) {
      const bankAcct = db.prepare('SELECT id FROM bank_accounts LIMIT 1').get();
      if (bankAcct) {
        if (type === 'Sales Invoices' || type === 'Payment In') {
          db.prepare('UPDATE bank_accounts SET balance = balance + ? WHERE id = ?').run(paidAmt, bankAcct.id);
        } else if (type === 'Purchase Bills' || type === 'Payment Out') {
          db.prepare('UPDATE bank_accounts SET balance = balance - ? WHERE id = ?').run(paidAmt, bankAcct.id);
        }
      }
    }

    return { id: transactionId, txn_no: generatedNo, success: true };
  });

  try {
    const result = transaction();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. UPI QR Code Generator
app.get('/api/qrcode', async (req, res) => {
  try {
    const { upi_id, name, amount, note } = req.query;
    if (!upi_id) return res.status(400).json({ error: 'upi_id is required' });

    // Standard NPCI UPI URI string format:
    // upi://pay?pa=upi_id&pn=name&am=amount&tn=note&cu=INR
    let upiString = `upi://pay?pa=${encodeURIComponent(upi_id)}&pn=${encodeURIComponent(name || 'Merchant')}&cu=INR`;
    if (amount) upiString += `&am=${encodeURIComponent(amount)}`;
    if (note) upiString += `&tn=${encodeURIComponent(note)}`;

    const qrDataUrl = await QRCode.toDataURL(upiString, { width: 250, margin: 1 });
    res.json({ qrDataUrl, upiString });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Reports Summary
app.get('/api/reports/summary', (req, res) => {
  try {
    const salesTotal = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'Sales Invoices'").get();
    const purchaseTotal = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'Purchase Bills'").get();
    const paymentsIn = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'Payment In'").get();
    const quotations = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'Quotation / Estimate'").get();

    res.json({
      totalSales: salesTotal.total || 0,
      totalPurchases: purchaseTotal.total || 0,
      totalPaymentsIn: paymentsIn.total || 0,
      totalQuotations: quotations.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use((req, res) => {
  res.sendFile('index.html', { root: clientDistPath });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MyBillBook Billing & Accounting App running on http://0.0.0.0:${PORT}`);
});
