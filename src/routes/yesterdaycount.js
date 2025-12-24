const express = require("express");
const Order = require("../models/Order");
const getYesterdayTillNowRange = require("../utils/dataRange2");

const router = express.Router();

router.get("/yesterday-till-now", async (req, res) => {
  try {
    const { from, to } = getYesterdayTillNowRange();

    const data = await Order.aggregate([
      {
        $match: {
          OrderDate: {
            $gte: from,
            $lte: to,
          },
        },
      },
      {
        $group: {
          _id: "$storeDomain",
          yesterdayTillNowOrders: { $sum: 1 },
          yesterdayTillNowValue: { $sum: "$totalPrice" },
        },
      },
      {
        $project: {
          _id: 0,
          accountName: "$_id",
          yesterdayTillNowOrders: 1,
          yesterdayTillNowValue: 1,
        },
      },
      { $sort: { yesterdayTillNowOrders: -1 } },
    ]);

    res.json({
      from,
      to,
      data,
    });
  } catch (err) {
    console.error("❌ yesterday-till-now error", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
