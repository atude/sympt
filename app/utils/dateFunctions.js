const moment = require('moment');

// console.log(moment(date).subtract(7, 'days').toISOString().substr(0, 10));
// console.log(moment(date).subtract(1, 'month').toISOString().substr(0, 10));
// console.log(moment(date).subtract(1, 'year').toISOString().substr(0, 10));
// console.log(moment(date).subtract(10, 'years').toISOString().substr(0, 10));

export const formatToString = (date) => date.toISOString().substr(0, 10);

export const getYesterday = (date) => moment.utc(date).subtract(1, 'day');
export const getLastWeek = (date) => moment.utc(date).subtract(1, 'week');

export const formatDateToDayMonth = (date) => moment.utc(date).format("DD/MM");
export const formatDateToMonthDay = (date) => moment.utc(date).format("MMM DD");
export const formatDateToMonth = (date) => moment.utc(date).format("MMM YYYY");
export const formatDateToYear = (date) => moment.utc(date).format("YYYY");

export const formatDateToDayMonthMap = (date) => moment.utc(date).subtract(1, 'day').format("DD MMM");

export const getDaysFromSimpleDate = (date, days) => {
  const dateFormatted = date.replace("-", " ") + " 2020";
  const nextDay = moment.utc(dateFormatted).add(days, 'day');
  return nextDay.format("DD-MMM");
};

export const getLastWeekArray = (date) => {
  let dates = [];

  [...Array(7).keys()].map((i) => {
    dates.push(formatToString(moment.utc(date).subtract(i, 'days')));
  });

  return dates.reverse();
};

export const getLastMonthQuarterSplitArray = (date) => {
  let dates = [];

  [...Array(4).keys()].map((i) => {
    dates.push(formatToString(moment.utc(date).subtract(i * 7, 'days')));
  });

  return dates.reverse();
};

export const getThisYearArray = (diseaseMonthly, date, thisMonthIndex) => {
  let dates = [];

  const startOfYearDate = new Date(new Date().getFullYear(), 0, 2);

  [...Array(12).keys()].map((i) => {
    if (i === thisMonthIndex) {
      dates.push(formatToString(moment.utc(date)));
      return;
    }
    // Fallback to start of month if end of month data not available
    const startOfMonthDate = formatToString(moment.utc(startOfYearDate).add(i, 'months').startOf('month'));
    const endOfMonthDate = formatToString(moment.utc(startOfYearDate).add(i, 'months').endOf('month'));

    if (!diseaseMonthly[endOfMonthDate]) {
      dates.push(startOfMonthDate);
      return;
    }
    dates.push(endOfMonthDate);
  });

  return dates;
};

export const getLastYearArray = (diseaseMonthly, date) => {
  let dates = [];

  [...Array(13).keys()].map((i) => {
    if (i === 0) {
      dates.push(formatToString(moment.utc(date)));
      return;
    }
    // Fallback to start of month if end of month data not available
    const startOfMonthDate = formatToString(moment.utc(date).subtract(i, 'months').startOf('month'));
    const endOfMonthDate = formatToString(moment.utc(date).subtract(i, 'months').endOf('month'));

    if (!diseaseMonthly[endOfMonthDate]) {
      dates.push(startOfMonthDate);
      return;
    }
    dates.push(endOfMonthDate);
  });

  return dates.reverse();
};

export const getLastDecadeArray = (diseaseYtd, date) => {
  let dates = [];

  [...Array(10).keys()].map((i) => {
    if (i === 0) {
      dates.push(formatToString(moment.utc(date)));
      return;
    }
    // Fallback to start of month at end of year if end of year data not available
    const startOfLastMonthDate = formatToString(moment.utc(date).subtract(i, 'years').endOf('year').startOf('month'));
    const endOfLastMonthDate = formatToString(moment.utc(date).subtract(i, 'years').endOf('year').endOf('month'));

    if (!diseaseYtd[endOfLastMonthDate]) {
      dates.push(startOfLastMonthDate);
      return;
    }
    dates.push(endOfLastMonthDate);
  });

  return dates.reverse();
};