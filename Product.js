class Product {
    constructor(title, originalPrice, discountPrice = 0, discountAmount = 0) {
        this.title = title;
        this.originalPrice = originalPrice;
        this.discountPrice = discountPrice;
        this.discountAmount = discountAmount;
    }
}
