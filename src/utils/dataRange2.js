function getYesterdayTillNowRange() {
  const now = new Date();

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // yesterday 00:00
  const from = new Date();
  from.setDate(now.getDate() - 1);
  from.setHours(0, 0, 0, 0);

  // yesterday till same time as now
  const to = new Date();
  to.setDate(now.getDate() - 1);
  to.setHours(hours, minutes, seconds, 999);

  return { from, to };
}

module.exports =  getYesterdayTillNowRange 
