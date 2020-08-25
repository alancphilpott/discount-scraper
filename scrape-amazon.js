const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const URL =
    "https://www.amazon.co.uk/HP-Display-Full-1920-Monitor/dp/B07FW1M8SJ";

async function monitor() {
    let page = await browse();
    await checkPrice(page);
}

async function browse() {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(URL);
        return page;

        // await browser.close();
    } catch (error) {
        console.log(error);
    }
}

async function checkPrice(page) {
    try {
        await page.reload();

        let html = await page.evaluate(() => document.body.innerHTML);
        const $ = cheerio.load(html);

        // $("#priceblock_ourprice", html).each(function () {
        //     let price = $(this).text();
        //     console.log(price);
        // })

        const price = $("#priceblock_ourprice");
        console.log(price.text());
    } catch (error) {
        console.log(error);
    }
}

monitor();