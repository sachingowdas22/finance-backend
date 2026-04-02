const express = require('express');
const app = express();

app.use(express.json());

let users = [];
let records = [];

function checkRole(allowedRoles) {
  return (req, res, next) => {
    const role = req.headers.role;

    if (!role) {
      return res.status(400).json({ message: "Role header missing" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
}


// Create User
app.post('/users', (req, res) => {
  const { name, role, status } = req.body;

  if (!name || !role) {
    return res.status(400).json({ message: "Name and role required" });
  }

  const user = {
    id: Date.now(),
    name,
    role,
    status: status || "active"
  };

  users.push(user);
  res.json(user);
});

// Get All Users (Admin Only)
app.get('/users', checkRole(['admin']), (req, res) => {
  res.json(users);
});

// Update User Role/Status (Admin Only)
app.patch('/users/:id', checkRole(['admin']), (req, res) => {
  const user = users.find(u => u.id == req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.role = req.body.role || user.role;
  user.status = req.body.status || user.status;

  res.json(user);
});


// Create Record (Admin Only)
app.post('/records', checkRole(['admin']), (req, res) => {
  const { amount, type, category, date, notes } = req.body;

  if (!amount || !type) {
    return res.status(400).json({ message: "Amount and type required" });
  }

  const record = {
    id: Date.now(),
    amount,
    type,
    category,
    date: date || new Date(),
    notes
  };

  records.push(record);
  res.json(record);
});

// Get Records (All roles can view)
app.get('/records', checkRole(['admin', 'analyst', 'viewer']), (req, res) => {
  let filtered = records;

  if (req.query.type) {
    filtered = filtered.filter(r => r.type === req.query.type);
  }

  if (req.query.category) {
    filtered = filtered.filter(r => r.category === req.query.category);
  }

  res.json(filtered);
});

// Update Record (Admin Only)
app.put('/records/:id', checkRole(['admin']), (req, res) => {
  const record = records.find(r => r.id == req.params.id);

  if (!record) {
    return res.status(404).json({ message: "Record not found" });
  }

  Object.assign(record, req.body);
  res.json(record);
});

// Delete Record (Admin Only)
app.delete('/records/:id', checkRole(['admin']), (req, res) => {
  records = records.filter(r => r.id != req.params.id);
  res.json({ message: "Record deleted" });
});


// Summary (Admin + Analyst)
app.get('/summary', checkRole(['admin', 'analyst']), (req, res) => {
  let totalIncome = 0;
  let totalExpense = 0;
  let categoryTotals = {};

  records.forEach(r => {
    if (r.type === 'income') totalIncome += r.amount;
    else totalExpense += r.amount;

    if (r.category) {
      categoryTotals[r.category] =
        (categoryTotals[r.category] || 0) + r.amount;
    }
  });

  res.json({
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    categoryTotals,
    recentTransactions: records.slice(-5)
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});