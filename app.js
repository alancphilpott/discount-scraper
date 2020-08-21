const request = require("request");
const cheerio = require("cheerio");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: "info.csv",
    header: [
        { id: "number", title: "NUMBER" },
        { id: "title", title: "TITLE" },
        { id: "link", title: "LINK" }
    ]
});

request("https://github.com/", (err, res, html) => {
    if (!err && res.statusCode == 200) {
        const $ = cheerio.load(html);

        const summaryLinkInfo = [];

        $(".col-lg-5 .summarylink").each((i, el) => {
            console.log("Scraping...");

            const title = $(el).find("h3").text().replace(/\s\s+/g, "");
            let link = $(el).attr("href");
            link = "https://github.com" + link;

            summaryLinkInfo.push({ number: i, title, link });
        });

        csvWriter
            .writeRecords(summaryLinkInfo)
            .then(() =>
                console.log(
                    "Scrape Complete. CSV File Was Written Successfully."
                )
            );
    } else {
        console.log(err);
    }
});
