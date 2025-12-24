const GoogleAdsSpend = require("../models/GoogleAdsSpend");
const {fetchGoogleAdsSpend}=require("../services/googleAds.service");

// 🔑 Store-wise mapping
const ACCOUNTS = [
  {
    customerId: "7961316066",
    refreshToken: process.env.GADS_REFRESH_TOKEN
  },
  {
    customerId: "3924824158",
    refreshToken: process.env.GADS_REFRESH_TOKEN
  },
  {
    customerId: "7539569580",
    refreshToken: process.env.GADS_REFRESH_TOKEN
  },
   {
    customerId: "2704917803",
    refreshToken: process.env.GADS_REFRESH_TOKEN
  },
   {
    customerId: "2205684394",
    refreshToken: process.env.GADS_REFRESH_TOKEN
  },
   {
    customerId: "3544670525",
    refreshToken: process.env.GADS_REFRESH_TOKEN
  },
   {
    customerId: "6471118093",
    refreshToken: process.env.GADS_REFRESH_TOKEN
  },
   {
    customerId: "5533706693",
    refreshToken: process.env.GADS_REFRESH_TOKEN
  },
   {
    customerId: "2473031090",
    refreshToken: process.env.GADS_REFRESH_TOKEN
  }, {
    customerId: "9296306607",
    refreshToken: process.env.GADS_REFRESH_TOKEN
  }
  ,
   {
    customerId: "7961316066",
    refreshToken: process.env.GADS_REFRESH_TOKEN
  },
   {
    customerId: "7539569580",
    refreshToken: process.env.GADS_REFRESH_TOKEN
  }, {
    customerId: "8675391774",
    refreshToken: process.env.GADS_REFRESH_TOKEN
  },
  {
    customerId: "2724124095",
    refreshToken: process.env.GADS_REFRESH_TOKEN
  },
  {
    customerId: "3108859578",
    refreshToken: process.env.GADS_REFRESH_TOKEN
  },
  {
    customerId: "4834920001",
    refreshToken: process.env.GADS_REFRESH_TOKEN
  },
  {
    customerId: "3348286405",
    refreshToken: process.env.GADS_REFRESH_TOKEN
  },
  {
    customerId: "8285636442",
    refreshToken: process.env.GADS_REFRESH_TOKEN
  },
  {
    customerId: "6436230500",
    refreshToken: process.env.GADS_REFRESH_TOKEN
  }
  
];

async function runGoogleAdsSpendSync() {
  console.log("🟡 Google Ads Spend Sync STARTED");

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const startDate = yesterday.toISOString().slice(0, 10);
  const endDate = today.toISOString().slice(0, 10);

  for (const acc of ACCOUNTS) {
    const rows = await fetchGoogleAdsSpend({
      customerId: acc.customerId,
      refreshToken: acc.refreshToken,
      startDate,
      endDate
    });

    if (!rows.length) continue;

    const ops = rows.map(r => ({
      updateOne: {
        filter: {
          customerId: r.customerId,
          spendDate: r.spendDate
        },
        update: { $set: r },
        upsert: true
      }
    }));

    await GoogleAdsSpend.bulkWrite(ops, { ordered: false });

    console.log(`✅ Google Ads synced for ${acc.customerId}`);
  }
}

module.exports = runGoogleAdsSpendSync;
