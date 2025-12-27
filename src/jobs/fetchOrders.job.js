const Order = require("../models/Order");
const { fetchOrders } = require("../services/shopify.service");
require("dotenv").config();
const STORES = JSON.parse(process.env.SHOPIFY_STORES || "[]");
console.log("Stores loaded:", STORES.length);

async function runShopifySync() {
     console.log("🟢 runShopifySync STARTED");
  const since = new Date();
  since.setDate(since.getDate() - 2);

  for (const store of STORES) {
    const orders = await fetchOrders({
      domain: store.domain,
      token: store.token,
      sinceISO: since.toISOString()
    });

    if (!orders.length) continue;

    const ops = orders.map(o => ({
      updateOne: {
        filter: { legacyOrderId: o.legacyOrderId },
        update: { $set: { ...o, storeDomain: store.domain } },
        upsert: true
      }
    }));

   const result= await Order.bulkWrite(ops, { ordered: false });
    console.log("🟢 Mongo result:", {
  inserted: result.upsertedCount,
  modified: result.modifiedCount,
  matched: result.matchedCount
});
    console.log(`✅ ${store.domain}: ${orders.length} synced`);
  }
}

module.exports = runShopifySync;
