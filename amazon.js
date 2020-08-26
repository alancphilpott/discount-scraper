const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const URL = "https://www.amazon.co.uk/s?k=";
const searchTerm = "Windows+10+Laptop";

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(URL + searchTerm, { waitUntil: "networkidle2" });

    let page_html = await page.evaluate(() => document.body.innerHTML);
    const $ = cheerio.load(page_html);

    try {
        await page.click("input#sp-cc-accept");
        console.log("Accepted Cookies.");
    } catch (err) {
        console.log("Cookies Already Accepted.");
    }

    await page.reload({ waitUntil: "networkidle2" });

    const products = [];
    $("div[data-index]").each(function (i, elem) {
        products[i] =
            "****" +
            $(this).find("a.a-text-normal").children("span").text().trim();
    });

    // products.join(", ");
    console.log(JSON.stringify(products));

    // console.log(data);

    await browser.close();
})();
