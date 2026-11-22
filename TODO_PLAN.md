# KRAVØN Production Elevation & Audit Alignment (V3.1)

- [x] 1. Gateway Reality & Sandbox Transparency (`server.js` & `public/checkout.html`):
  - Add live 2Checkout hosted checkout redirect generation (`POST /api/payment/create-session` or direct buy link)
  - Gate `/api/payment/simulate` strictly to sandbox/test environments (`NODE_ENV === 'test'` or `TWOCHECKOUT_MODE === 'SANDBOX'`)
  - Update `public/checkout.html` to clearly distinguish between Live Gateway Mode and Sandbox Demo Mode (no deceptive card simulation)
  - Enforce strict amount and currency validation in `/api/2checkout/webhook` (reject underpayment/currency mismatch)
  - Fix CJ fulfillment tracking handling (do not fabricate random tracking numbers on live orders; mark `AWAITING_CARRIER_ASSIGNMENT`)
  - Enforce Zero-Comment Rule across `server.js` and frontend
- [x] 2. Update All 10 Audit Dossiers (`audit_reports/`):
  - `KRAVON_EXECUTIVE_SUMMARY.md`: Update to V3.1 architecture, 23 automated tests, honest gateway readiness, updated 2026 tariff status
  - `KRAVON_BUSINESS_MODEL_ANALYSIS.md`: Update P&L with 2026 US de minimis suspension, EU €3 flat fee, real contribution ($66.32 pre-ad / $24.32 post-ad), break-even ROAS 1.78x
  - `KRAVON_TECHNICAL_AUDIT.md`: Document current architecture (Node.js 24, SQLite ACID, atomic transactions, decoupled payment/fulfillment, rate limiting, dedicated routes, 23/23 tests)
  - `KRAVON_UI_UX_AUDIT.md`: Document dedicated product pages, live tracking UI, atelier FAQ, 404 handler, mobile 390px zero-overflow
  - `KRAVON_CONTENT_AUDIT.md`: Inventory all copywriting, removal of AI-slop, replacement of fake reviews with Atelier Score
  - `KRAVON_PAYMENT_AUDIT.md`: Document Payoneer receiving vs 2Checkout Verifone underwriting reality, reserve requirements, HMAC-SHA256 webhook verification, amount validation
  - `KRAVON_LOGISTICS_AUDIT.md`: Document CJ API integration, order lifecycle (`UNFULFILLED` -> `CONFIRMED_AND_ROUTED` -> `PROCESSING_IN_CHINA_WAREHOUSE`), address mapping, carrier tracking
  - `KRAVON_SECURITY_AUDIT.md`: Detail CSP, HSTS, timing-safe webhook verification, secret sanitation (no default production secrets), atomic DB rollback
  - `KRAVON_MARKETING_STRATEGY.md`: Update realistic customer acquisition metrics, channel conversion estimates, and content calendar
  - `KRAVON_MASTER_FIX_ROADMAP.md`: Update all issue statuses with exact commit references and verification commands
- [x] 3. Run Verification Suite & Zero-Comment Audit:
  - Run full automated test suite `NODE_ENV=test node --test test/storefront.test.js` (23/23 tests pass)
  - Verify Zero-Comment Rule across all code files (100% clean)
  - Verify live server on port 3000 and Cloudflare tunnel
- [x] 4. Commit and Push to GitHub:
  - Stage all code and updated audit dossiers
  - Commit cleanly and push to `origin/main`

## Phase 4: Zero-Capital Launch Strategy (VIP Pre-Order Model & Viral Traffic Blueprint)
- [x] Step 1: Open official Payoneer registration page in Chrome for user verification ($0 cost, requires passport + phone)
- [x] Step 2: Implement VIP Pre-Order / Allocation Reservation UI across storefront (`public/index.html`, `public/checkout.html`, `public/checkout-success.html`, `public/app.js`)
- [x] Step 3: Implement backend allocation reservation handler in `server.js` (`paymentMethod: "ALLOCATION_RESERVATION"`) and update test suite (24 tests)
- [x] Step 4: Verify Zero-Comment Rule across all modified files (100% clean)
- [x] Step 5: Run full test suite `NODE_ENV=test node --test test/storefront.test.js` (24/24 tests pass, 0 failures)
- [ ] Step 6: Commit and push cleanly to GitHub `origin/main`
- [ ] Step 7: Provide exact, battle-tested TikTok/Reels viral script blueprint for 0-budget organic traffic generation
