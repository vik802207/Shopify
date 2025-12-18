const express = require("express");
const Order = require("../models/Order");

const router = express.Router();

router.get("/store-summary", async (req, res) => {
  const { filterType, startDate, endDate } = req.query;

  let match = {};
  const now = new Date();

  // 🔹 DATE FILTER LOGIC
  if (filterType === "today") {
    const from = new Date();
    from.setHours(0, 0, 0, 0);

    const to = new Date();
    to.setHours(23, 59, 59, 999);

    match.OrderDate = { $gte: from, $lte: to };
  }

  if (filterType === "yesterday") {
    const from = new Date();
    from.setDate(from.getDate() - 1);
    from.setHours(0, 0, 0, 0);

    const to = new Date(from);
    to.setHours(23, 59, 59, 999);

    match.OrderDate = { $gte: from, $lte: to };
  }

  if (filterType === "custom" && startDate && endDate) {
    const from = new Date(startDate);
    const to = new Date(endDate);
    to.setHours(23, 59, 59, 999);

    match.OrderDate = { $gte: from, $lte: to };
  }

  // 🔹 AGGREGATION
  const data = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$storeDomain",
        orderCount: { $sum: 1 },
        orderValue: { $sum: "$totalPrice" }
      }
    },
    {
      $project: {
        _id: 0,
        accountName: "$_id",
        orderCount: 1,
        orderValue: 1,

        // ---- SAME BUSINESS COLUMNS ----
        rtoPercent: { $literal: 0 },
        yesterdaySpend: { $literal: 0 },

        spendGMV: {
          $cond: [
            { $eq: ["$orderValue", 0] },
            0,
            { $multiply: [{ $divide: [0, "$orderValue"] }, 100] }
          ]
        },

cpp: {
  $cond: [
    { $eq: ["$orderCount", 0] },
    0,
    { $divide: ["$facebookSpend", "$orderCount"] }
  ]
},

        commission: { $multiply: ["$orderValue", 0.017] },
        eligibleShipments: "$orderCount",
        lpMonetization: { $multiply: ["$orderCount", 19.75] },

        totalMonetization: {
          $add: [
            { $multiply: ["$orderValue", 0.017] },
            { $multiply: ["$orderCount", 19.75] }
          ]
        },

        arrINR: { $multiply: ["$orderValue", 12] }
      }
    },
    { $sort: { orderValue: -1 } }
  ]);

  res.json(data);
});

module.exports = router;
