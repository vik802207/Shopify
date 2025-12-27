require("dotenv").config();
const mongoose = require("mongoose");
const cron = require("node-cron");
const runShopifySync = require("./jobs/fetchOrders.job");
const runFacebookSpendSync = require("./jobs/fetchFacebookSpend.job");
const runGoogleAdsSpendSync = require("./jobs/fetchGoogleAdsSpend.job");
const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());
console.log("🔥 index.js loaded");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error(err));

cron.schedule("*/1 * * * *", async () => {
  console.log("⏱ Shopify sync started");
  try {
    await runShopifySync();
    await runFacebookSpendSync();
    await runGoogleAdsSpendSync();
    console.log("✅ Shopify sync finished");
  } catch (err) {
    console.error("❌ Shopify sync error", err);
  }
});
app.get("/", (req, res) => {
    console.log("🟢 GET / called");
  res.send("Shopify Data Fetcher is running");
});
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/reports", require("./routes/report.routes"));
// http://localhost:8000/api/reports/ads-summary
app.use("/api/reports", require("./routes/adsReport.routes"));
app.use("/api/reports", require("./routes/combinedReport.routes"));
app.use("/api/reports", require("./routes/yesterdaycount"))
app.use("/api/reports", require("./routes/yesterdaytotalcount"))



app.listen(8000, () => {
  console.log("🚀 Backend running on port 8000");
});
console.log("🚀 Server running (cron active)");
