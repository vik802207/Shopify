const express = require("express");
const GoogleAdsSpend = require("../models/GoogleAdsSpend");

const router = express.Router();

/**
 * GET /api/reports/google-ads-summary
 * ?filterType=today|yesterday|custom
 * &startDate=YYYY-MM-DD
 * &endDate=YYYY-MM-DD
 */
router.get("/google-ads-summary", async (req, res) => {
  try {
    const { filterType, startDate, endDate } = req.query;

    let match = {};   // ✅ IMPORTANT

    // 🔹 TODAY
    if (filterType === "today") {
      const from = new Date();
      from.setHours(0, 0, 0, 0);

      const to = new Date();
      to.setHours(23, 59, 59, 999);

      match.spendDate = { $gte: from, $lte: to };
    }

    // 🔹 YESTERDAY
    else if (filterType === "yesterday") {
      const from = new Date();
      from.setDate(from.getDate() - 1);
      from.setHours(0, 0, 0, 0);

      const to = new Date(from);
      to.setHours(23, 59, 59, 999);

      match.spendDate = { $gte: from, $lte: to };
    }

    // 🔹 CUSTOM
    else if (filterType === "custom" && startDate && endDate) {
      const from = new Date(startDate);
      from.setHours(0, 0, 0, 0);

      const to = new Date(endDate);
      to.setHours(23, 59, 59, 999);

      match.spendDate = { $gte: from, $lte: to };
    }

    // 🔹 AGGREGATION
    const gAdsAgg = await GoogleAdsSpend.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$customerId",
          spend: { $sum: "$spend" }
        }
      },
      {
        $project: {
          _id: 0,
          customerId: "$_id",
          spend: { $round: ["$spend", 2] }
        }
      },
      { $sort: { spend: -1 } }
    ]);

    res.json(gAdsAgg);
  } catch (err) {
    console.error("❌ Google Ads Summary Error:", err);
    res.status(500).json({ error: "Google Ads summary failed" });
  }
});

module.exports = router;
