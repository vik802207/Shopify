const axios = require("axios");

async function fetchFacebookSpend({ adAccountId, token, dateStr }) {
  const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/insights`;

  const params = {
    fields: "spend",
    time_range: {
      since: dateStr,
      until: dateStr,
    },
    time_increment: 1,
    level: "account",
    access_token: token,
  };

  try {
    const { data } = await axios.get(url, {
      params,
      timeout: 15000, // ⏱️ safety
    });

    if (!data?.data?.length) return 0;

    return Number(data.data[0].spend || 0);

  } catch (err) {
    const status = err?.response?.status;
    const fbError = err?.response?.data?.error;

    // 🔥 MOST IMPORTANT PART
    if (status === 403) {
      console.log(`🚫 FB 403 SKIPPED → ${adAccountId}`);
      return 0; // ❗ skip this account, server alive
    }

    console.log(
      `⚠️ FB ERROR → ${adAccountId}`,
      fbError?.message || err.message
    );

    return 0; // ❗ kisi bhi error pe zero return
  }
}

module.exports = { fetchFacebookSpend };
