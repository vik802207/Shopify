const axios = require("axios");

const API_VERSION = "2024-10";

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

              displayFinancialStatus
              displayFulfillmentStatus
              paymentGatewayNames

              fulfillments(first: 5) {
                createdAt
                service { handle }
                trackingInfo {
                  number
                  url
                  company
                }
              }

              totalPriceSet { shopMoney { amount currencyCode } }
              totalTaxSet { shopMoney { amount currencyCode } }
              totalDiscountsSet { shopMoney { amount currencyCode } }

              shippingAddress { city province country }
              billingAddress { city province country }

              transactions {
                gateway
                kind
                status
                amountSet { shopMoney { amount currencyCode } }
              }
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
      }
    `;

    const variables = {
      first: PAGE_SIZE,
      after,
      q: `created_at:>=${sinceISO} -status:cancelled`,
    };

    let data;
    try {
      const res = await axios.post(
        gqlEndpoint,
        { query, variables },
        {
          headers: { "X-Shopify-Access-Token": token },
          timeout: 20000,
        }
      );
      data = res.data;
    } catch (err) {
      console.log(
        `🚫 SHOPIFY ERROR → ${domain}`,
        err?.response?.status,
        err?.response?.data || err.message
      );
      break;
    }

    const orders = data?.data?.orders;
    if (!orders) break;

    for (const { node } of orders.edges) {
      if (!node.legacyResourceId || seen.has(node.legacyResourceId)) continue;
      seen.add(node.legacyResourceId);

      const f = node.customerJourneySummary?.firstVisit || {};
      const l = node.customerJourneySummary?.lastVisit || {};
      const txn = node.transactions?.[0] || {};
      const fulfillment = node.fulfillments?.[0] || {};
      const tracking = fulfillment.trackingInfo?.[0] || {};
      // let unitCost = 0;

      // const li = node.lineItems?.edges?.[0]; // first line item
      // if (li) {
      //   unitCost = Number(
      //     li.node.variant?.inventoryItem?.unitCost?.amount || 0
      //   );
      // }

      results.push({
        storeDomain: domain,

        orderNumber: node.name.replace("#", ""),
        legacyOrderId: node.legacyResourceId,
        OrderDate: new Date(node.createdAt),

        // 💰 AMOUNTS
        totalPrice: Number(node.totalPriceSet?.shopMoney?.amount || 0),
        totalTax: Number(node.totalTaxSet?.shopMoney?.amount || 0),
        totalDiscounts: Number(node.totalDiscountsSet?.shopMoney?.amount || 0),
        currency: node.totalPriceSet?.shopMoney?.currencyCode || "INR",

        // 💳 PAYMENT
        displayFinancialStatus: node.displayFinancialStatus,
        paymentGateway: node.paymentGatewayNames?.[0] || "",
        transactionStatus: txn.status || "",
        transactionKind: txn.kind || "",
        transactionAmount: Number(txn.amountSet?.shopMoney?.amount || 0),

        // 🚚 FULFILLMENT
        displayFulfillmentStatus: node.displayFulfillmentStatus,
        fulfillmentService: fulfillment.service?.handle || "",
        fulfillmentTrackingCompany: tracking.company || "",
        fulfillmentTrackingNumber: tracking.number || "",
        fulfillmentTrackingUrl: tracking.url || "",
        fulfillmentCreatedAt: fulfillment.createdAt
          ? new Date(fulfillment.createdAt)
          : null,
        // 📍 ADDRESS
        shippingCity: node.shippingAddress?.city || "",
        shippingState: node.shippingAddress?.province || "",
        shippingCountry: node.shippingAddress?.country || "",

        billingCity: node.billingAddress?.city || "",
        billingState: node.billingAddress?.province || "",
        billingCountry: node.billingAddress?.country || "",

        // 📊 MARKETING
        utmSource: (
          l.utmParameters?.source ||
          f.utmParameters?.source ||
          ""
        ).toLowerCase(),
        utmMedium: (
          l.utmParameters?.medium ||
          f.utmParameters?.medium ||
          ""
        ).toLowerCase(),
        utmCampaign:
          l.utmParameters?.campaign || f.utmParameters?.campaign || "",
        referrerUrl: l.referrerUrl || f.referrerUrl || "",
        landingPage: l.landingPage || f.landingPage || "",

        sourceName: (node.sourceName || "").toLowerCase(),
      });
    }

    hasNext = orders.pageInfo.hasNextPage;
    after = orders.pageInfo.endCursor;
  }

  return results;
}

module.exports = { fetchOrders };
