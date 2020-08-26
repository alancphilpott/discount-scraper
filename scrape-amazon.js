const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const URL =
    "https://www.amazon.co.uk/HP-Display-Full-1920-Monitor/dp/B07FW1M8SJ";

async function monitor() {
    let page = await browse();
    await checkPrice(page);
}

async function browse() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(URL);
    return page;
}

async function checkPrice(page) {
    await page.reload();

    let html = await page.evaluate(() => document.body.innerHTML);
    const $ = cheerio.load(html);

    const productTitle = $("#productTitle").text().trim();
    console.log(productTitle)

    const originalPrice = $(".priceBlockStrikePriceString").text().trim();
    console.log(originalPrice)

    const discountPrice = $("#priceblock_ourprice").text();
    console.log(discountPrice);

    const discountAmount = $(".priceBlockSavingsString").text().match(/\((.+?)\)/)[1];
    console.log(discountAmount);
}

monitor();