const express = require("express");
const Order = require("../models/Order");

const router = express.Router();

/* ================= KPI CARDS ================= */
router.get("/kpis", async (req, res) => {
  const data = await Order.aggregate([
    {
      $group: {
        _id: null,
        orders: { $sum: 1 },
        revenue: { $sum: "$totalPrice" },
        discount: { $sum: "$totalDiscounts" },
        tax: { $sum: "$totalTax" },
        aov: { $avg: "$totalPrice" }
      }
    }
  ]);
  res.json(data[0] || {});
});

/* ================= DAILY SALES ================= */
router.get("/daily-sales", async (req, res) => {
  const data = await Order.aggregate([
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        orders: { $sum: 1 },
        revenue: { $sum: "$totalPrice" }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  res.json(data);
});

/* ================= STORE WISE ================= */
router.get("/store-wise", async (req, res) => {
  const data = await Order.aggregate([
    {
      $group: {
        _id: "$storeDomain",
        orders: { $sum: 1 },
        revenue: { $sum: "$totalPrice" }
      }
    }
  ]);
  res.json(data);
});

/* ================= CHANNEL WISE ================= */
router.get("/channel-wise", async (req, res) => {
  const data = await Order.aggregate([
    {
      $group: {
        _id: "$channel",
        orders: { $sum: 1 },
        revenue: { $sum: "$totalPrice" }
      }
    }
  ]);
  res.json(data);
});

/* ================= RECENT ORDERS ================= */
router.get("/recent-orders", async (req, res) => {
  const data = await Order.find()
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(data);
});

module.exports = router;
