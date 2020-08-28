class Product {
    constructor(title, originalPrice, discountPrice = 0, totalDiscount = 0) {
        this.title = title;
        this.originalPrice = originalPrice;
        this.discountPrice = discountPrice;
        this.discountAmount = totalDiscount;
    }
    getInfo() {
        return {
            title: this.title,
            originalPrice: this.originalPrice,
            discountPrice: this.discountPrice,
            discountAmount: this.discountAmount + "%"
        };
    }
}

module.exports = Product;
