function getDateRange(type, start, end) {
  const now = new Date();
  let from, to;

  if (type === "today") {
    from = new Date();
    from.setHours(0, 0, 0, 0);

    to = new Date();
    to.setHours(23, 59, 59, 999);
  }

  if (type === "yesterday") {
    from = new Date();
    from.setDate(from.getDate() - 1);
    from.setHours(0, 0, 0, 0);

    to = new Date(from);
    to.setHours(23, 59, 59, 999);
  }

  if (type === "custom" && start && end) {
    from = new Date(start);
    to = new Date(end);
    to.setHours(23, 59, 59, 999);
  }

  if (!from || !to) return {};

  return {
    createdAt: { $gte: from, $lte: to }
  };
}

module.exports = getDateRange;
