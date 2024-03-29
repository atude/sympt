import { parseKeyTerms, getFetchMeta } from "../utils/fetchTools";
  
// location: string, keyterms: array
export const getFeedArticles = async (key, startDate, endDate, keyterms, location, page) => {
  const searchTerms = parseKeyTerms(keyterms); // Turns key terms array into comma seperated string

  try {
    let response = await fetch(`https://sympt-server.herokuapp.com/articles/?startdate=${startDate}&enddate=${endDate}&location=${location}&keyterms=${searchTerms}&count=10&page=${page}`, 
      getFetchMeta(key));
    response = await response.json();
    return response;
  } catch (error) {
    console.warn(error);
  }

  return null;
};
  