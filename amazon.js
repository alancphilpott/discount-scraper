const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const config = require("config");
const BitlyClient = require("bitly").BitlyClient;

let bitly = null;
if (!config.get("bitlyAccessToken"))
    throw new Error("FATAL ERRORL: Unable To Detect Bitly Access Token");
else bitly = new BitlyClient(config.get("bitlyAccessToken"));

const URL = "https://www.amazon.co.uk";
const productToSearch = "RTX 2060";
const searchURL = "/s?k=" + productToSearch.replace(" ", "+");
const searchTerms = productToSearch.split(" ");
const link_regex = new RegExp(/^\/(?!gp).*/i);
let discount_products = [];
let $ = null;
const Product = require("./Product");

(async () => {
    // Launch Browser and Go To Page
    const browser = await puppeteer.launch({
        defaultViewport: null
    });
    const page = await browser.newPage();
    await page.goto(URL + searchURL, { waitUntil: "networkidle2" });

    // Load The HTML Into Variable
    let page_html = await page.evaluate(() => document.body.innerHTML);
    await page.close();
    // await browser.close();

    $ = cheerio.load(page_html);

    // Get The Pages Products
    console.log("Getting Products on Page...");
    const products = [];
    $("div[data-index]").each(function (i) {
        products[i] = $(this)
            .find("a.a-text-normal")
            .children("span")
            .text()
            .trim();
    });

    // Filter Links to Products Only
    console.log("Optimizing Results...");
    let links = [];
    let productLinks = [];
    $("div[data-index]").each(function (i) {
        links[i] = $(this).find("a.a-link-normal").attr("href");
        productLinks = links.filter((link) => link_regex.test(link));
    });

    // Visit Each Products Page
    console.log("Performing Magic...");
    const productPage = await browser.newPage();
    for (let i = 0; i < productLinks.length; i++) {
        const link = URL + productLinks[i];

        await productPage.goto(link, {
            waitUntil: "networkidle2"
        });

        // Retrieve Product Props
        let product_html = await productPage.evaluate(
            () => document.body.innerHTML
        );
        $ = cheerio.load(product_html);

        const product_title = $("#productTitle").text().trim();
        // Remove Currency Symbol From Prices
        let original_price = parseFloat(
            $(".priceBlockStrikePriceString")
                .text()
                .trim()
                .replace(/£/g, "")
                .replace(/,/, "")
        );
        let discount_price = parseFloat(
            $("#priceblock_ourprice").text().replace(/£/g, "").replace(/,/, "")
        );

        // Calculate Discount Amount
        let discount_amount = 0;
        let discount_diff = original_price - discount_price;

        if (
            !isNaN(original_price) &&
            !isNaN(discount_price) &&
            original_price != discount_price
        ) {
            discount_amount = ((discount_diff / original_price) * 100).toFixed(
                2
            );

            // Add Discount Products to Results
            console.log("Deal Found...");
            discount_products.push(
                new Product(
                    product_title,
                    original_price,
                    discount_price,
                    discount_amount,
                    await shorternURL(link)
                )
            );
        } else console.log("Discarding Rubbish Deal.");
    }
    await productPage.close();

    await browser.close();

    // Remove Products That Do Not Fully Match Search Terms
    let filteredProducts = discount_products.filter((product) =>
        searchTerms.every((term) => product.title.includes(term))
    );

    // Order Products By Highest Discount
    filteredProducts.sort(
        (a, b) => parseFloat(b.discountAmount) - parseFloat(a.discountAmount)
    );

    // Display The Results
    filteredProducts.forEach((product) => console.log(product.getInfo()));
})();

async function shorternURL(URL) {
    const response = await bitly.shorten(URL);
    return response.link;
}
