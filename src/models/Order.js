const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  storeDomain: String,

  orderNumber: String,
  legacyOrderId: { type: String, unique: true },

  OrderDate: Date,

  totalDiscounts: Number,
  totalPrice: Number,
  totalTax: Number,

  channel: String,
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,

  referrerUrl: String,
  landingPage: String,
  sourceName: String,
}, { timestamps: true });

module.exports = mongoose.model("Shopifydata", OrderSchema);
