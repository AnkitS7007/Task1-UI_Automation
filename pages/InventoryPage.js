import { BasePage } from './BasePage.js';

export class InventoryPage extends BasePage {
  constructor(page) {
    super(page);
    this.pageTitle = page.locator('.title');
    this.productItems = page.locator('.inventory_item');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartIcon = page.locator('.shopping_cart_link');
  }

  // Returns the action button (Add to cart / Remove) for a given product name
  getProductButton(productName) {
    return this.page
      .locator('.inventory_item')
      .filter({ hasText: productName })
      .locator('button');
  }

  async addItemToCart(productName) {
    await this.getProductButton(productName).click();
  }

  async getCartCount() {
    const visible = await this.cartBadge.isVisible();
    if (!visible) return 0;
    return parseInt(await this.cartBadge.textContent(), 10);
  }

  async getProductCount() {
    return this.productItems.count();
  }

  async goToCart() {
    await this.cartIcon.click();
  }
}
