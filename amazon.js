const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const URL = "https://www.amazon.co.uk";
const search_term = "/s?k=RTX+2060";
const link_regex = new RegExp(/^\/(?!gp).*/i);

(async () => {
    // Launch Browser and Go To Page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(URL + search_term, { waitUntil: "networkidle2" });

    // Accept The Page Cookies
    try {
        await page.click("input#sp-cc-accept");
        console.log("Accepted Cookies.");
    } catch (err) {
        console.log("Cookies Already Accepted.");
    }
    await page.reload({ waitUntil: "networkidle2" });

    // Load The HTML Into Variable
    let page_html = await page.evaluate(() => document.body.innerHTML);
    await page.close();
    await browser.close();

    const $ = cheerio.load(page_html);

    // Get The Pages Products
    const products = [];
    $("div[data-index]").each(function (i) {
        products[i] = $(this)
            .find("a.a-text-normal")
            .children("span")
            .text()
            .trim();
    });

    // Visit Each Products Page
    let links = [];
    let productLinks = [];
    $("div[data-index]").each(function (i) {
        links[i] = $(this).find("a.a-link-normal").attr("href");
        productLinks = links.filter((link) => link_regex.test(link));
    });

    for (let i = 0; i < productLinks.length; i++) {
        const linkToVisit = URL + productLinks[i];
        console.log(`Visiting Link ${linkToVisit}`);

        const productBrowser = await puppeteer.launch({
            defaultViewport: null
        });
        const productPage = await productBrowser.newPage();
        await productPage.setViewport({
            width: 1600,
            height: 900,
            deviceScaleFactor: 1
        });
        await productPage.goto(linkToVisit, {
            waitUntil: "networkidle2"
        });
        await productPage.screenshot({ path: `screens/screen${i}.png` });
        await productPage.close();
        await productBrowser.close();
    }

    // Print Product Data
})();
