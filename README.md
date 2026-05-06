<<<<<<< HEAD
# QA Automation — Playwright E2E Suite

End-to-end test automation for [SauceDemo](https://www.saucedemo.com) using **Playwright** and the **Page Object Model (POM)**.

---

## Application Under Test

**SauceDemo** (`https://www.saucedemo.com`) — a purpose-built e-commerce demo app with stable, deterministic UI selectors. It provides a realistic shopping flow (login → browse → cart → checkout → confirmation) without requiring account creation or external API keys.

---

## Automated Flow

The suite automates the **complete checkout path**, which is the primary revenue-generating flow of any e-commerce application. A regression anywhere in this path has direct business impact, making it the most valuable flow to keep green.

| # | Step | Key Assertions |
|---|------|----------------|
| 1 | Navigate to login page | Page title matches, form elements visible and enabled |
| 2 | Attempt login with invalid credentials | Error banner appears; URL stays on `/` |
| 3 | Attempt login with locked-out account | Error contains "locked out" |
| 4 | Login with valid credentials | Redirected to `/inventory`, product grid loads (≥ 6 items) |
| 5 | Add two products to cart | Cart badge increments to 1, then 2 |
| 6 | Open cart | Both product names present, checkout button enabled |
| 7 | Submit checkout form empty | Inline error "First Name is required" visible |
| 8 | Fill customer info and continue | Redirected to checkout overview |
| 9 | Verify order summary | Item count = 2; total > subtotal (tax applied) |
| 10 | Complete order | Confirmation header reads "Thank you for your order!" |
| 11 | Return to products | Redirected to `/inventory`; cart badge absent |
| 12 | Add then remove an item | Badge disappears; button text reverts to "Add to cart" |

---

## Project Structure

```
.
├── pages/                     # Page Object Model classes
│   ├── BasePage.js            # Shared helpers
│   ├── LoginPage.js
│   ├── InventoryPage.js
│   ├── CartPage.js
│   ├── CheckoutInfoPage.js
│   ├── CheckoutOverviewPage.js
│   └── OrderConfirmationPage.js
├── tests/
│   ├── example.spec.js        # Default Playwright scaffold (unused)
│   └── e2e/
│       └── checkout.spec.js   # Main test suite (4 tests)
├── utils/
│   └── testData.js            # Credentials and test fixtures
├── .github/
│   └── workflows/
│       └── playwright.yml     # CI — parallel matrix across 3 browsers
├── playwright.config.js
├── package.json
└── README.md
```

---

## Tools & Versions

| Tool | Version |
|------|---------|
| Node.js | 20 LTS |
| `@playwright/test` | ^1.49.0 |
| Browsers | Chromium, Firefox, WebKit (via Playwright) |

---

## Setup

```bash
# 1. Install Node dependencies
npm install

# 2. Install Playwright browsers
npx playwright install --with-deps
```

---

## Running Tests

```bash
# Run all tests across all three browsers
npm test

# Run in headed (visible browser) mode
npm run test:headed

# Run only on Chromium
npm run test:chromium

# Open the HTML report after a run
npm run test:report
```

---

## CI / GitHub Actions

The workflow (`.github/workflows/playwright.yml`) triggers on:

- **Push** to `main` / `master`
- **Pull Request** targeting `main` / `master`
- **Daily schedule** at 06:00 UTC (catches upstream app regressions)
- **Manual dispatch** via the Actions tab

Tests run in a **parallel browser matrix** (Chromium · Firefox · WebKit). On failure, traces and screenshots are uploaded as artifacts (retained 7 days). HTML reports are always uploaded (retained 14 days).

---

## Assumptions

1. `https://www.saucedemo.com` is publicly accessible and its credentials (`standard_user` / `secret_sauce`) remain valid — these are the app's official demo credentials.
2. The product catalogue includes at least 6 items (the default SauceDemo inventory is 6).
3. No authentication tokens need to be stored between tests; each test starts from the login page.
4. The app's `data-test` attributes are stable — SauceDemo is specifically designed for automation practice, so these are intentionally maintained.
=======
