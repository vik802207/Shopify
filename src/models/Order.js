const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    storeDomain: String,

    orderNumber: String,
    legacyOrderId: { type: String, unique: true },

    OrderDate: Date,

    totalDiscounts: Number,
    totalPrice: Number,
    totalTax: Number,
    currency: { type: String, default: "INR" },
    // 💳 PAYMENT INFO
    displayFinancialStatus: String, // PENDING, PAID, REFUNDED
    paymentGateway: String, // COD / Razorpay / Shopify Payments
    transactionStatus: String, // PENDING / SUCCESS
    transactionKind: String, // SALE / REFUND
    transactionAmount: Number,
    // 🚚 FULFILLMENT
    displayFulfillmentStatus: String, // FULFILLED / UNFULFILLED / PARTIAL
    fulfillmentService: String,       // manual / shiprocket
    fulfillmentTrackingCompany: String,
    fulfillmentTrackingNumber: String,
    fulfillmentTrackingUrl: String,
    fulfillmentCreatedAt: Date,
    // 📍 SHIPPING ADDRESS
    shippingCity: String,
    shippingState: String,
    shippingCountry: String,

    // 📍 BILLING ADDRESS
    billingCity: String,
    billingState: String,
    billingCountry: String,

    channel: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,

    referrerUrl: String,
    landingPage: String,
    sourceName: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shopifydata", OrderSchema);
