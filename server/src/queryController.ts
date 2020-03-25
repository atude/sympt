/* eslint-disable no-await-in-loop */
import puppeteer from 'puppeteer';
import urlPageResultIds from './services/pageIdScrapeService';
import contentScraper from './services/contentScrapeService';
import {
  ScrapeResults, PageObject, GenError, URLFormattedTerms, Location, 
} from './types';
import { articlesRef } from './firebase/collectionReferences';
import { formatQueryUrl, getNormalisedDate } from './utils/formatters';
import puppeteerConfig from './constants/puppeteerConfig';
import { isError } from './utils/checkFunctions';
import generateError from './utils/generateError';

// Minimum articles to return when count is not set
const minGeneralArticles = 5;

// Max number of promises to be running
const chunkSize = 5;

export const getArticlesForceScrape = async (queryUrl: string): (
  Promise<PageObject[] | GenError> 
) => {
  const formattedQuery = formatQueryUrl(queryUrl);
  if (isError(formattedQuery)) {
    console.log(formattedQuery);
    return formattedQuery;
  }

  const browser = await puppeteer.launch(puppeteerConfig);

  try {
    const idResults: ScrapeResults | GenError = await urlPageResultIds(
      formattedQuery as URLFormattedTerms,
      browser,
    );
 
    if (isError(idResults)) {
      console.log(idResults);
      return idResults;
    }

    console.log(`!  testing: number of processed results = ${idResults.results.length}`);
    console.log(`!  testing: list of id results = ${idResults.results}`);

    let processedResults: PageObject[] = [];

    for (let index = 0; index < idResults.results.length; index += chunkSize) {
      const tempResults = idResults.results.slice(index, index + chunkSize);
      console.log(`processing resultant pages: ${tempResults}`);

      const pagePromiseGroup: Promise<PageObject>[] = 
        tempResults.map((pageID: string) => contentScraper(pageID, browser));

      processedResults = processedResults.concat(await Promise.all(pagePromiseGroup));
    }

    processedResults = processedResults.filter((pageContent) => pageContent && pageContent.id);
      
    await browser.close();
    console.log("Scraped pages successfully.");

    // Save to firestore
    processedResults.forEach(async (pageData) => {
      if (pageData.id) {
        // Format page data for easier firestore indexing
        const searchTerms: string[] = [
          ...pageData.reports[0].syndromes, 
          ...pageData.reports[0].diseases,
        ];
        const timestamp: number = getNormalisedDate(pageData.date_of_publication).getTime() / 1000;
        const locationsRaw: string[] = [];
        pageData.reports[0].locations.forEach((location: Location) => {
          locationsRaw.push(location.country.toLowerCase());
          locationsRaw.push(location.location?.toLowerCase() || "");
          locationsRaw.push(location.subArea?.toLowerCase() || "");
        });
        const locations: string[] = [...new Set(
          locationsRaw.filter((strLocation) => strLocation && strLocation !== ""),
        )];


        await articlesRef.doc(pageData.id).set({
          ...pageData,
          _search: searchTerms,
          _timestamp: timestamp,
          _locations: locations,
        });
      }
    });
    
    return processedResults;
  } catch (error) {
    await browser.close();
    console.log("Something went wrong while scraping. Try restarting the server.");
    console.log(error);
    // TODO: Should return our own error here
    return error;
  }
};

export const getArticles = async (queryUrl: string): (
  Promise<PageObject[] | GenError> 
) => {
  const formattedQuery = formatQueryUrl(queryUrl);
  if (isError(formattedQuery)) return formattedQuery;
  const {
    keyTerms, startDate, endDate, location, count, page,
  } = formattedQuery;

  const startDateTimestamp = getNormalisedDate(startDate).getTime() / 1000;
  const endDateTimestamp = getNormalisedDate(endDate).getTime() / 1000;

  const fetchArticles = await articlesRef
    .where("_search", "array-contains", keyTerms)
    .where("_timestamp", ">=", startDateTimestamp)
    .where("_timestamp", "<=", endDateTimestamp)
    // .where("_locations", "array-contains", location)
    .get();
  console.log(location);

  const filteredArticles: FirebaseFirestore.DocumentData[] = 
    fetchArticles.docs.map((document) => document.data()).reverse();
  
  console.log(`${filteredArticles.length} articles fetched.`);
  if (!count && filteredArticles.length < minGeneralArticles) {
    console.log("Failed to find articles in DB. Scraping instead...");
    return getArticlesForceScrape(queryUrl);
  }

  if (count && page && ((count * page + count) > filteredArticles.length)) {
    console.log("Page exceeds article limit.");
    return generateError(500, "Page max reached", "Current page exceeds total articles remaining");
  }
  
  return count ? 
    filteredArticles.splice(page ? count * page : 0, count) as PageObject[] : 
    filteredArticles as PageObject[];
};
