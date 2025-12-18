const axios = require("axios");

const API_VERSION = "2024-10";
const REST_VERSION = "2023-10";

async function fetchOrders({ domain, token, sinceISO }) {
  const gqlEndpoint = `https://${domain}/admin/api/${API_VERSION}/graphql.json`;
  const PAGE_SIZE = 100;
  let after = null;
  let hasNext = true;
  const seen = new Set();
  const results = [];

  while (hasNext) {
    const query = `
      query($first:Int!, $after:String, $q:String!) {
        orders(first:$first, after:$after, query:$q, sortKey:CREATED_AT) {
          pageInfo { hasNextPage endCursor }
          edges {
            node {
              legacyResourceId
              name
              createdAt
              sourceName
              totalPriceSet { shopMoney { amount } }
              totalTaxSet { shopMoney { amount } }
              totalDiscountsSet { shopMoney { amount } }
              customerJourneySummary {
                firstVisit {
                  utmParameters { source medium campaign }
                  landingPage
                  referrerUrl
                }
                lastVisit {
                  utmParameters { source medium campaign }
                  landingPage
                  referrerUrl
                }
              }
            }
          }
        }
      }`;

    const variables = {
      first: PAGE_SIZE,
      after,
      q: `created_at:>=${sinceISO} -status:cancelled`
    };

    const { data } = await axios.post(
      gqlEndpoint,
      { query, variables },
      { headers: { "X-Shopify-Access-Token": token } }
    );

    const orders = data.data.orders;

    for (const { node } of orders.edges) {
      if (!node.legacyResourceId || seen.has(node.legacyResourceId)) continue;
      seen.add(node.legacyResourceId);

      const f = node.customerJourneySummary?.firstVisit || {};
      const l = node.customerJourneySummary?.lastVisit || {};
    
      results.push({
        orderNumber: node.name.replace("#", ""),
        legacyOrderId: node.legacyResourceId,
        OrderDate: new Date(node.createdAt),

        totalDiscounts: Number(node.totalDiscountsSet?.shopMoney?.amount || 0),
        totalPrice: Number(node.totalPriceSet?.shopMoney?.amount || 0),
        totalTax: Number(node.totalTaxSet?.shopMoney?.amount || 0),

        utmSource: (l.utmParameters?.source || f.utmParameters?.source || "").toLowerCase(),
        utmMedium: (l.utmParameters?.medium || f.utmParameters?.medium || "").toLowerCase(),
        utmCampaign: l.utmParameters?.campaign || f.utmParameters?.campaign || "",
        referrerUrl: l.referrerUrl || f.referrerUrl || "",
        landingPage: l.landingPage || f.landingPage || "",
        sourceName: (node.sourceName || "").toLowerCase()
      });
    }

    hasNext = orders.pageInfo.hasNextPage;
    after = orders.pageInfo.endCursor;
  }

  return results;
}

module.exports = { fetchOrders };
