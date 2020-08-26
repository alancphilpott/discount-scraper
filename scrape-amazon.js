const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const URL = "https://www.amazon.co.uk/s?k=";
const searchTerm = "Windows+10+Laptop";

async function monitor() {
    let page = await browse();
    await getAllProductsInSearch(page);
    // await getProductInfo(page);
}

async function browse() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(URL + searchTerm, { waitUntil: "networkidle2" });
    return page;
}

async function getProductInfo(page) {
    await page.reload();

    let html = await page.evaluate(() => document.body.innerHTML);
    const $ = cheerio.load(html);

    const productTitle = $("#productTitle").text().trim();
    console.log(productTitle);

    const originalPrice = $(".priceBlockStrikePriceString").text().trim();
    console.log(originalPrice);

    const discountPrice = $("#priceblock_ourprice").text();
    console.log(discountPrice);

    const discountAmount = $(".priceBlockSavingsString")
        .text()
        .match(/\((.+?)\)/)[1];
    console.log(discountAmount);
}

async function getAllProductsInSearch(page) {
    let html = await page.evaluate(() => document.body.innerHTML);
    const $ = cheerio.load(html);

    try {
        await page.click("input#sp-cc-accept");
    } catch (err) {
        console.log("Cookies Already Accepted.");
    }

    await page.$eval(
        "#twotabsearchtextbox",
        (box) => (box.value = "windows 10 laptop")
    );

    await (await page.$('input[type="text"].nav-input')).press("Enter");
}

monitor();
