const axios = require("axios");

async function fetchFacebookSpend({ adAccountId, token, dateStr }) {
  const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/insights`;

  const params = {
    fields: "spend",
    time_range: {
      since: dateStr,
      until: dateStr
    },
    time_increment: 1,
    level: "account",
    access_token: token
  };

  const { data } = await axios.get(url, { params });

  if (!data.data || !data.data.length) return 0;

  return Number(data.data[0].spend || 0);
}

module.exports = { fetchFacebookSpend };
