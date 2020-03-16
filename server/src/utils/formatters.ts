import generateError from "./generateError";
import { GenError, URLFormattedTerms } from "../types";

export const dateRegexWords = /\d{1,2} [a-zA-Z]{3} \d{4}/gi;
export const dateRegexNum = /^([0-9]{4})-([0-9]{2})-([0-9]{2}).*/;

export const getNormalisedDate = (dateString: string): Date => new Date(`${dateString} UTC`);

export const formatDateToExact = (dateString: string) => {
  console.log(dateString);
  const dateRaw = getNormalisedDate(dateString);
  return dateRaw.toISOString().split("T")[0];
};

export const formatQueryUrl = (queryUrl: string): GenError | URLFormattedTerms => {
  const urlParams = new URLSearchParams(queryUrl);
  const keyTerms = urlParams.get('keyterms');
  const startDate = urlParams.get('startdate');
  const endDate = urlParams.get('enddate');
  const location = urlParams.get('location');
  const count = Number(urlParams.get('count'));

  if (!startDate) {
    return generateError(403, "Bad Request", "No specified start date.");
  } if (!endDate) {
    return generateError(403, "Bad Request", "No specified end date.");
  } if (!location) {
    return generateError(403, "Bad Request", "No specified location.");
  // eslint-disable-next-line no-restricted-globals
  } if (count < 0 || count > 10 || isNaN(count)) {
    return generateError(403, "Bad Request", "Results count must be a number between 0 and 10.");
  }

  // Compare the startdate submitted with the regex
  const startDateGroups = startDate.match(dateRegexNum);
  let [, startYear, startMonth, startDay] = "";
  if (startDateGroups) {
    [, startYear, startMonth, startDay] = startDateGroups;
  } else {
    return generateError(403, "Bad Request", "Invalid start date.");
  }

  // Compare the enddate submitted with the regex
  const endDateGroups = endDate.match(dateRegexNum);
  let [, endYear, endMonth, endDay] = "";
  if (endDateGroups) {
    [, endYear, endMonth, endDay] = endDateGroups;
  } else {
    return generateError(403, "Bad Request", "Invalid end date.");
  }

  return {
    startDate: `${startMonth}/${startDay}/${startYear}`,
    endDate: `${endMonth}/${endDay}/${endYear}`,
    keyTerms: keyTerms?.toLowerCase().split(',').filter((keyterm) => keyterm !== ""),
    location,
    count,
  } as URLFormattedTerms;
};
