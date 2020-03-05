/* eslint-disable camelcase */

export type ScrapeResults = {
  results?: string[];
  error?: {
    errorNo: number;
    errorName: string;
    errorMessage: string;
  };
}

export type PageObject = {
  url: string,
  date_of_publication: string,
  headline: string,
  main_text: string,
  reports: [],
}