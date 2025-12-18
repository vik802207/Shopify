const express = require("express");
const FacebookSpend = require("../models/FacebookSpend");

const router = express.Router();

router.get("/ads-summary", async (req, res) => {
  const { filterType, startDate, endDate } = req.query;

  let match = {};

  if (filterType === "today") {
    const from = new Date();
    from.setHours(0, 0, 0, 0);

    const to = new Date();
    to.setHours(23, 59, 59, 999);

    match.spendDate = { $gte: from, $lte: to };
  }

  if (filterType === "yesterday") {
    const from = new Date();
    from.setDate(from.getDate() - 1);
    from.setHours(0, 0, 0, 0);

    const to = new Date(from);
    to.setHours(23, 59, 59, 999);

    match.spendDate = { $gte: from, $lte: to };
  }

  if (filterType === "custom" && startDate && endDate) {
    match.spendDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate + "T23:59:59.999Z")
    };
  }

  const data = await FacebookSpend.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$adAccountId",
        totalSpend: { $sum: "$spend" }
      }
    },
    {
      $project: {
        _id: 0,
        adAccountId: "$_id",
        totalSpend: 1
      }
    }
  ]);

  res.json(data);
});

module.exports = router;
