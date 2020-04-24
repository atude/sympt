"use strict";
exports.__esModule = true;
// * Inspired by SIR model for spread of Disease - The Differential Equation Model 
// * https://www.maa.org/press/periodicals/loci/joma/the-sir-model-for-spread-of-disease-the-differential-equation-model
/* Differential equations
 * ds/dt = -b*s(t)*i(t)
 * di/dt = b*s(t)*i(t) - k*i(t)
 * dr/dt = k*i(t)
 */
var puppeteer = require('puppeteer');
// Some constants and assumptions
// const population = 24600000;
// const population = 1421000;

// * Final Daily Contacts constant, most severe rate of transmission in Australia
var dailyContacts = 1 / 6;

// The 'b' variable is reduced when the public is practicing social distancing
// * Final Daily Contacts constant with social distancing
var dailyContactsDistancing = 1 / 25;
// Average recovery period 'k' is 2 weeks for mild cases, and 3-6 weeks for sever cases
// One recovery every 21 days
var recovery = 1 / 21;

// Will return an array of nCases, with t (days) as the index
// t will be from current time, e.g. t=0 is current day, t=1 is tomorrow

// * Scrapping function, puppeteer returning error, fix if possible
// (async () => {
//     let url = "https://www.worldometers.info/coronavirus/country/australia/";

//     let browser = await puppeteer.launch({args: ['--no-sandbox --disable-setuid-sandbox']});
//     let page = await browser.newPage();

//     await page.goto(url, { waitUntil: 'networkidle2' });

//     for (let i = 0; i < averageSize; i++) {
//         let date_ob = new Date();
//         if (date_ob.getDate() > 0) {
//             let date = "newsdate" + date_ob.getFullYear().toString() + "-" + ("0" + (date_ob.getMonth() + 1).toString()) + "-" + (date_ob.getDate() - i).toString();
//             let data = await page.evaluate(() => {
//                 let newCase = /[0-9]+/.exec(document.querySelector('div[id="' + date + '"] > div > div > ul > li > strong').innerText)[0];
//                 return newCase;
//             });
//             newCases.push(data);
//         }
//     }

//     console.log(newCases);
//     debugger;

//     await browser.close();

// })();

exports.computePrediction = function (day, currCases, recovered, population, socialDistancing) {
    var it0 = currCases / population;
    var rt0 = recovered / population;
    var st0 = (population - (currCases + recovered)) / population;

    let contacts = dailyContacts;    
    if (socialDistancing) {
        contacts = dailyContactsDistancing;
    }

    var nCases = new Array(day);
    var currSt;
    var currIt;
    var currRt;

    for (var i = 0; i <= day; i++) {
        currSt = -contacts * st0 * it0;
        currIt = -currSt - recovery * it0;
        currRt = recovery * it0;

        st0 += currSt;
        it0 += currIt;
        rt0 += currRt;

        nCases.push([st0 * population, it0 * population, rt0 * population]);
    }
    return nCases;
};

// This is the less reliable function of the two
// Prefferred to use the function considering the recovered population
exports.computePredictionNoRecovery = function (day, currCases, population, socialDistancing) {
    var it0 = currCases / population;
    var rt0 = 0;        // This is the difference between the two functions
    var st0 = (population - (currCases + 1)) / population;

    let contacts = dailyContacts;
    if (socialDistancing) {
        contacts = dailyContactsDistancing;
    }

    var nCases = new Array(day);
    var currSt;
    var currIt;
    var currRt;

    for (var i = 0; i <= day; i++) {
        currSt = -contacts * st0 * it0;
        currIt = -currSt - recovery * it0;
        currRt = recovery * it0;

        st0 += currSt;
        it0 += currIt;
        rt0 += currRt;

        nCases.push([st0 * population, it0 * population, rt0 * population]);
    }
    return nCases;

}