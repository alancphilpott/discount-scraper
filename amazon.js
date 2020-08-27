const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const URL = "https://www.amazon.co.uk";
const search_term = "/s?k=RTX+2060";
const link_regex = new RegExp(/^\/(?!gp).*/i);

(async () => {
    // Launch Browser and Go To Page
    const browser = await puppeteer.launch({
        defaultViewport: null
    });
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
    // await browser.close();

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

    // Filter Links to Products Only
    let links = [];
    let productLinks = [];
    $("div[data-index]").each(function (i) {
        links[i] = $(this).find("a.a-link-normal").attr("href");
        productLinks = links.filter((link) => link_regex.test(link));
    });

    // Visit Each Products Page
    const productPage = await browser.newPage();
    for (let i = 0; i < productLinks.length; i++) {
        await productPage.goto(URL + productLinks[i], {
            waitUntil: "networkidle2"
        });

        await productPage.screenshot({ path: `screens/screen${i}.png` });
    }
    await productPage.close();

    await browser.close();
})();
