const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const URL = "https://www.adverts.ie";
const searchPrefix = "/for-sale/q_";

const Product = require("./Product");

// Get A List (Array) of Product Objects Containing Required Info
async function getListOfProducts(userInput) {
    console.log("[search] Performing Search...");

    const chrome = await puppeteer.launch();
    const searchResultsPage = await chrome.newPage();
    await searchResultsPage.goto(URL + searchPrefix + userInput, {
        waitUntil: "networkidle2"
    });

    const allProductLinks = await getLinkForEachProduct(searchResultsPage);
    const listOfProducts = await getEachProductInfo(allProductLinks, chrome);

    await chrome.close();
    return listOfProducts;
}

// Using The Search Results Page - Get A Link for Each Product
async function getLinkForEachProduct(searchResultsPage) {
    console.log("[info] Getting Link For Each Product...");

    const productLinks = [];

    const html = await searchResultsPage.evaluate(
        () => document.body.innerHTML
    );

    const $ = cheerio.load(html);

    $('div[class="item-details"]').each(function (i) {
        const productLink = $(this).find('div[class="price"] a').attr().href;
        productLinks.push(productLink);
    });

    return productLinks;
}

async function getEachProductInfo(allProductLinks, chrome) {
    console.log("[info] Getting Required Information...");

    const products = [];

    for (let i = 0; i < allProductLinks.length; i++) {
        let link = allProductLinks[i];
        const productPage = await chrome.newPage();
        await productPage.goto(URL + link, {
            waitUntil: "networkidle2"
        });
        console.log(`[link] Visting ${URL}${link}...`);

        const html = await productPage.evaluate(() => document.body.innerHTML);

        const $ = cheerio.load(html);

        const title = $("h1[class='page_heading'] span").text().trim();
        const price = $("span[class='ad_view_info_cell price']").text().trim();
        const seller = $("a[class='inverted sellername']").text();

        const positiveFeedback = $("span[class='positive']")
            .find("span.count")
            .text();

        const negativeFeedback = $("span[class='negative']")
            .find("span.count")
            .text();

        let userRating = 0;
        let feedbackDiff = 0;
        if (positiveFeedback > negativeFeedback) {
            feedbackDiff = positiveFeedback - negativeFeedback;
            userRating = ((feedbackDiff / positiveFeedback) * 100).toFixed(0);
        }

        products.push({ title, price, seller, userRating });
        console.log("[info] Product Saved.");
    }

    // "div[id='feedback'] span[class='positive'] span[class='count']"

    return products;
}

getListOfProducts("gtx+1060")
    .then((products) => console.log(products))
    .catch((err) => console.log);
// products.forEach((p) => console.log(p));
// console.log(products);

// const productTitle = $(this).find('div[class="title"] a').text();
// const productPrice = $(this).find('div[class="price"] a').text();
