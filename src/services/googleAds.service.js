const { GoogleAdsApi } = require("google-ads-api");

const client = new GoogleAdsApi({
  client_id: process.env.GADS_CLIENT_ID,
  client_secret: process.env.GADS_CLIENT_SECRET,
  developer_token: process.env.GADS_DEVELOPER_TOKEN
});

async function fetchGoogleAdsSpend({
  customerId,
  refreshToken,
  startDate,
  endDate
}) {
  try {
    const customer = client.Customer({
      customer_id: customerId.replace(/-/g, ""), // CLIENT
      login_customer_id: "6976590323",            // MCC
      refresh_token: refreshToken
    });

    const query = `
      SELECT
        segments.date,
        metrics.cost_micros
      FROM customer
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
    `;

    const rows = await customer.query(query);

    return rows.map(r => ({
      customerId,
      spendDate: new Date(r.segments.date),
      spend: Number(r.metrics.cost_micros) / 1e6
    }));

  } catch (error) {
    const errorCode = error?.response?.status || error?.code;

    // ✅ 403 / permission errors → SKIP & CONTINUE
    if (errorCode === 403 || errorCode === 401) {
      console.warn(`⚠️ Google Ads access denied for customer ${customerId}. Skipping.`);
      return []; // ⬅️ VERY IMPORTANT
    }

    // ❌ Any other error → still log but don't crash server
    console.error("❌ Google Ads API Error:", {
      customerId,
      message: error.message,
      code: errorCode
    });

    return [];
  }
}

module.exports = {
  fetchGoogleAdsSpend
};
