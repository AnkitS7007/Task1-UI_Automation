import { BasePage } from './BasePage.js';

export class OrderConfirmationPage extends BasePage {
  constructor(page) {
    super(page);
    this.confirmationHeader = page.locator('.complete-header');
    this.confirmationText = page.locator('.complete-text');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
    this.checkmarkImage = page.locator('.pony_express');
  }

  async goBackHome() {
    await this.backHomeButton.click();
  }
}
