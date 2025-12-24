const Order = require("../models/Order");
const express = require("express");
const getYesterdayRangeIST = require("../utils/dateRange3foryesterdaydata");

const router = express.Router();

router.get("/yesterday-summary", async (req, res) => {
  try {
    const { startUTC, endUTC } = getYesterdayRangeIST();

    const data = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startUTC, $lte: endUTC },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: "$storeDomain",
          yesterdayOrderCount: { $sum: 1 },
          yesterdayOrderValue: { $sum: "$totalPrice" },
        },
      },
      {
        $project: {
          _id: 0,
          domain: "$_id",
          yesterdayOrderCount: 1,
          yesterdayOrderValue: 1,
        },
      },
      { $sort: { yesterdayOrderValue: -1 } },
    ]);

    res.json(data);
  } catch (err) {
    console.error("❌ Yesterday Summary Error:", err);
    res.status(500).json({ error: "Failed to fetch yesterday summary" });
  }
});
module.exports = router;
