# KRAVØN — INTERNATIONAL PAYMENT & GATEWAY AUDIT (V2.0)
**Auditor Role:** International Payment Integration Specialist & Fintech Legal Auditor  
**Gateways:** 2Checkout (Verifone) Global Processing + Payoneer Multi-Currency Hub  
**Status:** CODE REVIEWED & REGULATORY RISK MODELLED  

---

## 1. THE UZBEKISTAN MERCHANT ONBOARDING REALITY

A major blind spot in many cross-border e-commerce plans from Central Asia is assuming that opening a Payoneer account automatically provides a live credit card checkout.

### True Verification Pathway:
1. **Payoneer is NOT a Merchant Acquirer:**
   - Payoneer is a receiving virtual bank account (Checking / Wire routing). It cannot process Visa/Mastercard transactions on a website directly.
   - A dedicated merchant aggregator (such as **2Checkout / Verifone**) is required to present the credit card input fields and tokenize transactions.
2. **2Checkout (Verifone) KYB Underwriting Requirements for Uzbekistan:**
   - **Entity Status:** Operating as an unregistered individual will lead to rejection. A registered entity (YATT — YaTT/YTT Sole Proprietorship or MCHJ / LLC) is necessary.
   - **Supplier Agreement:** 2Checkout requires proof that goods can be fulfilled. The CJ Dropshipping authorization agreement and API integration records must be submitted during onboarding.
   - **Website Compliance Check:** 2Checkout manually inspects the storefront before activating live mode. The site MUST display:
     - Clear pricing in USD / EUR.
     - Visible Visa, Mastercard, and SSL security capsules.
     - Published Refund, Privacy, Terms, and Shipping policies with real contact channels.
     - Our recent updates to `/privacy.html`, `/refund.html`, `/shipping.html`, and `/contact.html` fulfill 100% of these underwriting mandates.

---

## 2. FEES, RESERVES & CASH FLOW IMPACT

| Expense Item | Expected Rate | Impact on $118 Sale | Reality Check |
| :--- | :--- | :--- | :--- |
| **Domestic Base Processing** | 3.5% + $0.35 | $4.48 | Standard 2Checkout tier |
| **International Cross-Border Surcharge** | 2.0% | $2.36 | Applied when buyer card is non-domestic |
| **Payoneer Payout / FX Withdrawal** | 1.5% – 2.0% | $1.80 | Fee to withdraw USD from Payoneer to local bank |
| **Total Payment Drag** | **~7.3%** | **$8.64** | Deducted automatically before net payout |
| **Rolling Reserve Hold** | **10% – 15%** | **$11.80 – $17.70** | **Held for 90–120 days** against chargeback risk |

> **Cash Flow Warning (P0):** Because 2Checkout holds a 10-15% rolling reserve and processes payouts weekly with a 7-day lag, the business MUST maintain sufficient working capital ($1,500+) to prepay CJ Dropshipping for fulfillment before customer funds are cleared into Payoneer.

---

## 3. APPLE PAY & GOOGLE PAY FEASIBILITY

- **Native Web Checkout (Apple Pay):** Requires an active Apple Merchant ID and domain verification file (`/.well-known/apple-developer-merchantid-domainassociation`).
- 2Checkout supports Apple Pay via their hosted payment checkout or inline 2Pay.js integration.
- For maximum conversion, enabling the hosted 2Checkout checkout overlay is recommended for the initial 30 days to leverage pre-integrated Apple Pay without custom iOS certificate management.

---

## 4. TECHNICAL WEBHOOK SECURITY (RECENTLY HARDENED)

- **Previous Vulnerability (SEC-01):** Anyone could send a forged JSON POST to `/api/2checkout/webhook` and falsely flag an order as paid.
- **Current Hardened State:** The webhook endpoint now requires a cryptographic `x-webhook-secret` header matching `process.env.WEBHOOK_SECRET`. Unauthenticated requests are rejected with `401 Unauthorized` (Verified by unit test in `test/storefront.test.js`).
