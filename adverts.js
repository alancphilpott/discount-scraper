const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const Product = require("./Product");

const URL = "https://www.adverts.ie";
const searchTerm = "/for-sale/q_gtx+1060";

(async () => {
    const chrome = await puppeteer.launch();
    const searchResultsPage = await chrome.newPage();
    await searchResultsPage.goto(URL + searchTerm, {
        waitUntil: "networkidle2"
    });

    const productData = await getProducts(searchResultsPage);

    await chrome.close();
})();

async function getProducts(searchResultsPage) {
    const products = [];

    const html = await searchResultsPage.evaluate(
        () => document.body.innerHTML
    );

    const $ = cheerio.load(html);

    $('div[class="item-details"]').each(function (i) {
        const productTitle = $(this).find('div[class="title"] a').text();
        const productPrice = $(this).find('div[class="price"] a').text();

        console.log("Title: " + productTitle + "\n" + "Price: " + productPrice);
    });
}
