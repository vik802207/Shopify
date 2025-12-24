const Order = require("../models/Order");
const { fetchOrders } = require("../services/shopify.service");

const STORES = [
  {
    domain:"t12rzj-m9.myshopify.com",
    token:"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"
  },
  {
    domain:"navyatasolutions.myshopify.com",
    token:"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"
  },
  {
    domain:"xfauc1-x1.myshopify.com",
    token:"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"
  },
  {
    domain:"thebibastore.myshopify.com",
    token:"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"
  }
  ,
  {
    domain:"eirfu0-jc.myshopify.com",
    token:"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"
  },
  {
    domain: "a67d5c-0a.myshopify.com",
    token: "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"
  },
  {
    domain: "a152ff-db.myshopify.com",
    token: "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"
  },
  {
    domain: "31cf7c-b9.myshopify.com",
    token: "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"
  },
  {
    domain: "a68cb8-80.myshopify.com",
    token: "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"
  },
  {
    domain: "63fe3d-2.myshopify.com",
    token: "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"
  },
  {
    domain:"hpqykh-8s.myshopify.com",
    token:"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"
  },{
    domain:"00qj4d-6r.myshopify.com",
    token:"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"
  },{
    domain:"0dds7v-ms.myshopify.com",
    token:"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"
  },{
    domain:"1br9tm-se.myshopify.com",
    token:"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"
  },{
    domain:"n2ua2d-mb.myshopify.com",
    token:"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"
  },{
    domain:"ff7gju-1m.myshopify.com",
    token:"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"
  },
  
  {
    domain:"9tnkwm-pk.myshopify.com",
    token:"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"
  },{
    domain:"w0bcy7-e7.myshopify.com",
    token:"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"
  },{
    domain:"1awwc0-qw.myshopify.com",
    token:"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"
  },{
    domain:"xchkbr-xk.myshopify.com",
    token:"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"
  },{
    domain:"jaipur-kurta-fashion.myshopify.com",
    token:"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"
  },{
    domain:"yrye9p-3p.myshopify.com",
    token:"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"
  },{
    domain:"cu1fn1-14.myshopify.com",
    token:"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"
  },{
    domain:"rauhza-6b.myshopify.com",
    token:"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"
  },{
    domain:"spdbg8-c8.myshopify.com",
    token:"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"
  },{
    domain:"6dqt0q-ab.myshopify.com",
    token:"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"
  },{
    domain:"pep9dc-m5.myshopify.com",
    token:"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"
  },{
    domain:"5ffq2q-fg.myshopify.com",
    token:"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"
  },{
    domain:"ws5kks-t1.myshopify.com",
    token:"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"
  },{
    domain:"cmqd7a-hv.myshopify.com",
    token:"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"
  },{
    domain:"heew6u-gn.myshopify.com",
    token:"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"
  },{
    domain:"jrbr8x-zg.myshopify.com",
    token:"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"
  },
  {
    domain:"jcvh4a-sr.myshopify.com",
    token:"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"
  },{
    domain:"stuybh-d5.myshopify.com",
    token:"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"
  },{
    domain:"jaipuri-fashion-2.myshopify.com",
    token:"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"
  }
];


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
