import express from 'express';
import admin from './firebase/firebaseInit';
import { getArticles, getDiseaseCases } from './queryController';
import populateDb from './services/dbPopulationService';
import { verifyUser, addUserDetails } from './services/firebaseService';
import generateError from './utils/generateError';
import getMetadata from './utils/getMetadata';
import { isError } from './utils/checkFunctions';
import { ApiUser, ApiLog } from './types';
import { addLog } from './services/devAccountService';

import scrapeDiseasesStats from './services/diseaseCasesScrapeService';
import getNewsArticles from './utils/getNewsArticles';

const app = express();
const port: number = Number(process.env.PORT) || 4000;
console.log(`Admin init: ${!!admin}`);

/* Example query */
// ?keyterms=coronavirus
// &startdate=2019-12-01T00:00:00
// &enddate=2020-02-01T00:00:00
// &location=china

app.all('/*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Authorization");
  next();
});

app.get('/articles/', async (req, res) => {
  const user: ApiUser = await verifyUser(req.headers.authorization);
  const timestamp: string = (new Date().getTime() / 1000).toFixed(0).toString();

  if (user.authenticated) {
    const articles = await getArticles(req.query);
    const log: ApiLog = {
      timestamp,
      success: !isError(articles),
      query: req.originalUrl,
      error: isError(articles) ? articles : null,
    };

    let metadata = null;
    if (!isError(articles)) {
      metadata = getMetadata(articles.length, user.email);
    } else {
      metadata = getMetadata(0, user.email);
    }

    await addLog(user, log);
    if (isError(articles)) {
      res.send(articles);
    } else {
      res.send({ metadata, articles });
    }
  } else {
    const error = generateError(
      401, 
      "Invalid authentication token", 
      "Could not match token with user",
    );
    await addLog(user, {
      timestamp,
      success: false,
      query: req.originalUrl,
      error,
    });
    res.status(401).send(error);
  }
});


// TODO: move logic into queryController, possibly add auth
app.get('/_news/', async (req, res) => {
  const newsArticles = await getNewsArticles(req.query);
  res.send(newsArticles);
});

app.get('/_twitter/', async (req, res) => {
  // todo
});

app.get('/_cases/', async (req, res) => {
  res.send(await getDiseaseCases(req.query));
});

app.post('/_userDetails/', async (req, res) => {
  const user: ApiUser = await verifyUser(req.headers.authorization);

  console.log(user);
  if (user.authenticated) {
    res.send(addUserDetails(req.query, user.email));
  }
});

app.listen(port, '0.0.0.0', () => console.log(`--> Server is listening on ${port}`));

// Populate db every 8 hrs
setInterval(() => {
  console.log("Start generic scrape from yesterday's posts...");
  const auDate = new Date().toLocaleString("en-US", { timeZone: "Australia/Sydney" });
  scrapeDiseasesStats(new Date(auDate));
  populateDb();
}, 1000 * 60 * 60 * 6);
