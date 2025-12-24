const getYesterdayRangeIST = () => {
  const now = new Date();

  // IST offset (+5:30)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffsetMs);

  // Yesterday date in IST
  const yesterday = new Date(istNow);
  yesterday.setDate(istNow.getDate() - 1);

  const start = new Date(yesterday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(yesterday);
  end.setHours(23, 59, 59, 999);

  // convert back to UTC (Mongo stores UTC)
  return {
    startUTC: new Date(start.getTime() - istOffsetMs),
    endUTC: new Date(end.getTime() - istOffsetMs),
  };
};

module.exports =  getYesterdayRangeIST ;
