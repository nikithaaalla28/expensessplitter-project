const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require('dns').setDefaultResultOrder('ipv4first');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});
app.use(express.static(path.join(__dirname, "public")));

const groupRoutes = require("./Routes/groupRoutes");
const expenseRoutes = require("./Routes/expenseRoutes");
const authRoutes = require("./Routes/authRoutes");
const { router: adminRoutes, startReminderProcessor } = require("./Routes/adminRoutes");
const feedbackRoutes = require("./Routes/feedbackRoutes");
const { verifyEmailConfiguration, isEmailConfigured } = require("./services/mailService");

app.use("/api/expenses", expenseRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);

app.get("/", (req, res) => {
  res.send("Server Running");
});

connectDB()
  .then(async () => {
    if (isEmailConfigured()) {
      console.log("\n📧 Initializing Email Service...");
      await verifyEmailConfiguration();
    }

    if (typeof startReminderProcessor === 'function') {
      startReminderProcessor();
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server Running on Port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Error:", err.message || err);
    process.exit(1);
  });
