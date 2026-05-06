/**
 * E2E Test Suite: Complete E-commerce Checkout Flow — SauceDemo (https://www.saucedemo.com)
 *
 * Flow chosen: Login → Browse Products → Add Items to Cart → Checkout → Order Confirmation
 *
 * Why this flow matters:
 * This is the core revenue path of any e-commerce application. A silent regression in
 * authentication, cart management, form validation, or order confirmation directly impacts
 * conversions. Automating this critical path gives confidence that every build leaves the
 * checkout experience intact. The suite also covers a negative login case and a cart
 * mutation (add → remove), ensuring edge-case behaviour is locked down alongside the
 * happy path.
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { InventoryPage } from '../pages/InventoryPage.js';
import { CartPage } from '../pages/CartPage.js';
import { CheckoutInfoPage } from '../pages/CheckoutInfoPage.js';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage.js';
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage.js';
import {
  VALID_USER,
  LOCKED_USER,
  INVALID_USER,
  CHECKOUT_INFO,
  PRODUCTS,
} from '../utils/testData.js';

test.describe('SauceDemo — E-commerce Checkout', () => {
  let loginPage;
  let inventoryPage;
  let cartPage;
  let checkoutInfoPage;
  let checkoutOverviewPage;
  let orderConfirmationPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutInfoPage = new CheckoutInfoPage(page);
    checkoutOverviewPage = new CheckoutOverviewPage(page);
    orderConfirmationPage = new OrderConfirmationPage(page);
  });

  // ─── Negative: invalid credentials ─────────────────────────────────────────

  test('should display error for invalid credentials', async ({ page }) => {
    await loginPage.navigate();

    await expect(page).toHaveTitle(/Swag Labs/);
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();

    await loginPage.login(INVALID_USER.username, INVALID_USER.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Epic sadface');
    // Must remain on login page — no redirect
    await expect(page).toHaveURL('/');
  });

  // ─── Negative: locked-out user ─────────────────────────────────────────────

  test('should block locked-out user with a clear message', async ({ page }) => {
    await loginPage.navigate();

    await loginPage.login(LOCKED_USER.username, LOCKED_USER.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('locked out');
    await expect(page).toHaveURL('/');
  });

  // ─── Happy path: full checkout ──────────────────────────────────────────────

  test('should complete a full checkout from login to order confirmation', async ({ page }) => {
    // Step 1 — Login page loads correctly
    await loginPage.navigate();
    await expect(page).toHaveTitle(/Swag Labs/);
    await expect(loginPage.loginButton).toBeEnabled();

    // Step 2 — Valid login redirects to inventory
    await loginPage.login(VALID_USER.username, VALID_USER.password);
    await expect(page).toHaveURL(/inventory/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
    const productCount = await inventoryPage.getProductCount();
    expect(productCount).toBeGreaterThanOrEqual(6);

    // Step 3 — Add two products; cart badge reflects correct count
    await inventoryPage.addItemToCart(PRODUCTS[0]);
    await expect(inventoryPage.cartBadge).toBeVisible();
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.addItemToCart(PRODUCTS[1]);
    await expect(inventoryPage.cartBadge).toHaveText('2');

    const cartCount = await inventoryPage.getCartCount();
    expect(cartCount).toBe(2);

    // Step 4 — Cart page shows exactly the two added items
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/cart/);
    await expect(cartPage.pageTitle).toHaveText('Your Cart');

    const itemsInCart = await cartPage.getItemCount();
    expect(itemsInCart).toBe(2);
    await expect(cartPage.getCartItemByName(PRODUCTS[0])).toBeVisible();
    await expect(cartPage.getCartItemByName(PRODUCTS[1])).toBeVisible();
    await expect(cartPage.checkoutButton).toBeEnabled();

    // Step 5 — Form validation: submitting empty form shows inline error
    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/checkout-step-one/);

    await checkoutInfoPage.submitEmpty();
    await expect(checkoutInfoPage.errorMessage).toBeVisible();
    await expect(checkoutInfoPage.errorMessage).toContainText('First Name is required');

    // Step 6 — Fill valid customer info and advance to overview
    await checkoutInfoPage.fillInfo(
      CHECKOUT_INFO.firstName,
      CHECKOUT_INFO.lastName,
      CHECKOUT_INFO.postalCode,
    );
    await checkoutInfoPage.continue();
    await expect(page).toHaveURL(/checkout-step-two/);

    // Step 7 — Overview: item count matches; total is subtotal + tax
    const overviewItemCount = await checkoutOverviewPage.getItemCount();
    expect(overviewItemCount).toBe(2);

    const subtotal = await checkoutOverviewPage.getSubtotal();
    expect(subtotal).toBeGreaterThan(0);

    const total = await checkoutOverviewPage.getTotal();
    expect(total).toBeGreaterThan(subtotal);

    await expect(checkoutOverviewPage.finishButton).toBeEnabled();

    // Step 8 — Finish order; confirmation page appears with expected content
    await checkoutOverviewPage.finish();
    await expect(page).toHaveURL(/checkout-complete/);

    await expect(orderConfirmationPage.confirmationHeader).toBeVisible();
    await expect(orderConfirmationPage.confirmationHeader).toHaveText('Thank you for your order!');
    await expect(orderConfirmationPage.confirmationText).toContainText('dispatched');
    await expect(orderConfirmationPage.checkmarkImage).toBeVisible();
    await expect(orderConfirmationPage.backHomeButton).toBeEnabled();

    // Step 9 — Back to products; cart is cleared (no badge)
    await orderConfirmationPage.goBackHome();
    await expect(page).toHaveURL(/inventory/);
    await expect(inventoryPage.cartBadge).not.toBeVisible();
  });

  // ─── Cart mutation: add then remove ────────────────────────────────────────

  test('should update cart badge when an item is removed from the inventory page', async ({
    page,
  }) => {
    await loginPage.navigate();
    await loginPage.login(VALID_USER.username, VALID_USER.password);
    await expect(page).toHaveURL(/inventory/);

    await inventoryPage.addItemToCart(PRODUCTS[0]);
    await expect(inventoryPage.cartBadge).toHaveText('1');

    // After adding, button label flips to "Remove"
    const productButton = inventoryPage.getProductButton(PRODUCTS[0]);
    await expect(productButton).toHaveText('Remove');

    await productButton.click();

    // Badge disappears and button reverts to "Add to cart"
    await expect(inventoryPage.cartBadge).not.toBeVisible();
    await expect(productButton).toContainText(/add to cart/i);
  });
});
