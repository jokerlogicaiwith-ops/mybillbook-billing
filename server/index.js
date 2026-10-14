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

// 1. Company Settings
app.get('/api/company', (req, res) => {
  try {
    const company = db.prepare('SELECT * FROM company_settings LIMIT 1').get();
    res.json(company || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/company', (req, res) => {
  try {
    const { name, phone, email, gstin, address, upi_id, tagline, terms } = req.body;
    db.prepare(`
      UPDATE company_settings 
      SET name = ?, phone = ?, email = ?, gstin = ?, address = ?, upi_id = ?, tagline = ?, terms = ?
      WHERE id = 1
    `).run(name, phone, email, gstin, address, upi_id, tagline, terms);
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
app.get('/api/items', (req, res) => {
  try {
    const { search, category } = req.query;
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
    const items = db.prepare(query).all(...params);
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

// 5. Transactions / Invoices APIs
app.get('/api/transactions', (req, res) => {
  try {
    const { type, search, limit } = req.query;
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    if (type && type !== 'all') {
      query += ' AND type = ?';
      params.push(type);
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
    const party = txn.party_id ? db.prepare('SELECT * FROM parties WHERE id = ?').get(txn.party_id) : null;
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
    const party = txn.party_id ? db.prepare('SELECT id, name, phone, gstin, address, state FROM parties WHERE id = ?').get(txn.party_id) : null;
    const company = db.prepare('SELECT name, phone, email, gstin, address, upi_id, tagline, terms FROM company_settings LIMIT 1').get();

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
      subtotal,
      tax_amount,
      discount,
      amount,
      paid_amount,
      payment_type,
      notes,
      items // Array of items
    } = req.body;

    const totalAmt = parseFloat(amount) || 0;
    const paidAmt = parseFloat(paid_amount) || 0;
    const balanceDue = Math.max(0, totalAmt - paidAmt);
    const status = balanceDue === 0 ? 'Paid' : (paidAmt > 0 ? 'Partial' : 'Unpaid');

    // Auto-generate txn_no if blank
    let generatedNo = txn_no;
    if (!generatedNo) {
      const countRow = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE type = ?').get(type);
      const prefix = type === 'Sales Invoices' ? 'INV' : (type === 'Quotation / Estimate' ? 'EST' : (type === 'Purchase Bills' ? 'PUR' : 'TXN'));
      generatedNo = `${prefix}-${Date.now().toString().slice(-4)}-${countRow.count + 1}`;
    }

    // Insert transaction
    const insertTxnStmt = db.prepare(`
      INSERT INTO transactions (
        txn_no, type, date, party_id, party_name, subtotal, tax_amount, discount, 
        amount, paid_amount, balance_due, payment_type, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      notes || ''
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

app.listen(PORT, () => {
  console.log(`MyBillBook Billing & Accounting App running on http://localhost:${PORT}`);
});
