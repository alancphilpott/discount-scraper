const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const URL = "https://www.amazon.co.uk";
const search_term = "/s?k=RTX+2080";
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
        await productPage.goto(URL + productLinks[i], {
            waitUntil: "networkidle2"
        });

        // Retrieve Product Props
        let product_html = await productPage.evaluate(
            () => document.body.innerHTML
        );
        $ = cheerio.load(product_html);

        const product_title = $("#productTitle").text().trim();
        // Remove Currency Symbol From Prices
        let original_price = $(".priceBlockStrikePriceString")
            .text()
            .trim()
            .replace(/£/g, "");
        let discount_price = $("#priceblock_ourprice").text().replace(/£/g, "");

        // Calculate Discount Amount
        let discount_amount = 0;
        let discount_diff = original_price - discount_price;
        if (
            original_price != "" &&
            discount_price != "" &&
            original_price != discount_price
        )
            discount_amount = ((discount_diff / original_price) * 100).toFixed(
                2
            );

        // Ensure Required Properties Are Set
        if (
            product_title != "" &&
            original_price != "" &&
            discount_amount != 0
        ) {
            console.log("Deal Found...");
            discount_products.push(
                new Product(
                    product_title,
                    original_price,
                    discount_price,
                    discount_amount
                )
            );
        } else console.log("Discarding Rubbish Deal.");
    }
    await productPage.close();

    await browser.close();

    // Display The Results
    discount_products.forEach((product) => console.log(product.getInfo()));
})();
