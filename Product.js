class Product {
    constructor(title, originalPrice, discountPrice, totalDiscount, link) {
        this.title = title;
        this.originalPrice = originalPrice;
        this.discountPrice = discountPrice;
        this.discountAmount = totalDiscount;
        this.link = link;
    }
    getInfo() {
        return {
            title: this.title,
            originalPrice: this.originalPrice,
            discountPrice: this.discountPrice,
            discountAmount: this.discountAmount + "%",
            link: this.link
        };
    }
}

module.exports = Product;
