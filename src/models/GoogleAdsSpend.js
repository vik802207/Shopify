const mongoose = require("mongoose");

const GoogleAdsSpendSchema = new mongoose.Schema({
  customerId: String,          // 123-456-7890
  spendDate: { type: Date, index: true },
  spend: Number
}, { timestamps: true });

GoogleAdsSpendSchema.index(
  { customerId: 1, spendDate: 1 },
  { unique: true } // 🚫 no duplicates
);

module.exports = mongoose.model("GoogleAdsSpend", GoogleAdsSpendSchema);
