const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const SECRET = process.env.SECRET;

// ================= CONNECT MONGODB =================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ================= SCHEMA =================
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model("User", userSchema);

const transactionSchema = new mongoose.Schema({
  username: String,
  title: String,
  amount: Number,
  type: String
});

const Transaction = mongoose.model("Transaction", transactionSchema);


// ================= AUTH =================
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Token salah" });
  }
}


// ================= REGISTER =================
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ error: "Isi semua field" });
  }

  const exist = await User.findOne({ username });
  if (exist) {
    return res.json({ error: "User sudah ada" });
  }

  const hashed = await bcrypt.hash(password, 10);

  await User.create({
    username,
    password: hashed
  });

  res.json({ success: true });
});


// ================= LOGIN =================
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ error: "Isi semua field" });
  }

  const user = await User.findOne({ username });
  if (!user) return res.json({ error: "User tidak ada" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.json({ error: "Password salah" });

  const token = jwt.sign({ username }, SECRET);

  res.json({ token });
});


// ================= TRANSACTIONS =================

// GET
app.get("/api/transactions", auth, async (req, res) => {
  const data = await Transaction.find({
    username: req.user.username
  });

  res.json(data);
});

// POST
app.post("/api/transactions", auth, async (req, res) => {
  await Transaction.create({
    username: req.user.username,
    title: req.body.title,
    amount: req.body.amount,
    type: req.body.type
  });

  res.json({ success: true });
});

// DELETE
app.delete("/api/transactions/:id", auth, async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});


// ================= STATS =================
app.get("/api/stats", auth, async (req, res) => {
  const data = await Transaction.find({
    username: req.user.username
  });

  let income = 0;
  let expense = 0;

  data.forEach(item => {
    if (item.type === "income") income += item.amount;
    else expense += item.amount;
  });

  res.json({
    income,
    expense,
    balance: income - expense
  });
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server jalan di network");
});
