const mongoose = require("mongoose");

const FacebookSpendSchema = new mongoose.Schema({
  adAccountId: String,

  spendDate: { type: Date, index: true }, // 🔥 VERY IMPORTANT

  spend: Number,

}, { timestamps: true });

FacebookSpendSchema.index(
  { adAccountId: 1, spendDate: 1 },
  { unique: true } // 🚫 duplicate prevention
);

module.exports = mongoose.model("FacebookSpend", FacebookSpendSchema);
