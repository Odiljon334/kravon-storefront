# KRAVØN · Master Prompt V2.0 bilan muvofiqlik tekshiruvi

**Tekshirilgan holat** `fe31a09`, Node.js 24.21.0, Express, SQLite va statik frontend. `shopify_theme/` alohida Liquid paket. Repo nomi va Shopify konfiguratsiyasi faol Shopify checkout dalili bo‘la olmaydi. Dossier o‘nta so‘ralgan faylni o‘z ichiga oladi va commit xabarida V2.0 deb ko‘rsatilgan. Prompt matnining aynan nusxasi repoda aniqlanmadi. Muvofiqlik yuborilgan talablar bo‘yicha baholandi.

**Natija** Mavjud dossier mavzularning asosiy qismini ochadi. To‘lovdan real yetkazishgacha dalillar, audit qamrovi va dalil belgilari bo‘yicha qisman mos. Real sotuvga tayyorlik tasdiqlanmagan. `6.4/10` bahosida hisoblash mezoni, og‘irliklar va bloklangan sinovlarning ta’siri ko‘rsatilmagan.

## 19 band bo‘yicha qamrov

| Prompt bandi | Holat va dalil |
| --- | --- |
| 1–2. Ekspertiza va brend | Qisman. Brend yo‘nalishi berilgan. Konversiya, real xizmat va original mahsulot tasvirlarining dalillari yetishmaydi. |
| 3. Biznes modeli | Qisman. Maskaga P&L va uch ssenariy bor. Hisoblar AOV va SKU xarajatlarini aralashtiradi, fixed xarajatlar hamda bojxona bilan moslashtirilmagan. Supplier narxi va raqib taqqosi manbasiz. |
| 4. Texnik arxitektura | Qisman. Runtime, DB, katalog va asosiy API yozilgan. Barcha endpoint, env va deployment tekshiruvlari, backup/restore, logging va monitoring dalillari yo‘q. |
| 5–6. UI/UX va shablonga xos nuqsonlar | Qisman. 9 viewport jadvali va 3 UX topilmasi bor. Sessiya artefakti, har sahifa bo‘yicha dalil, mahsulot foto auditi va newsletter/maket stock kabi topilmalar yo‘q. |
| 7. Inglizcha matnlar | Qisman. 7 ta before/after misol bor. Butun UI, har SKU, metama’lumot, xato va tranzaksion email bo‘yicha to‘liq inventar yo‘q. |
| 8. Mahsulot auditi | Qisman. API katalogida maska, denim, hoodie va dekorativ prop set bor. Ferrofluid savdo katalogida kuzatilmadi. Har SKU uchun variant, foto, fit/material, ta’minot, xavfsizlik va qaytarish dalili yetishmaydi. Denim va hoodie o‘lcham variantlari har mahsulot ichida bitta CJ VID ni ulashadi. |
| 9. Checkout va payment | **P0.** Lokal checkout to‘lov provayderiga chiqmaydi. Merchant eligibility, KYC/KYB, Visa/Mastercard/Apple Pay, settlement, payout, reserve, refund/dispute, invoice va sandbox to‘liq tasdiqlanmagan. |
| 10. Logistika | Qisman. Handling va tranzit haqida taxminlar mavjud. SKU va mamlakat bo‘yicha CJ/1688 kotirovkasi, inventar, tashuvchi, tracking, yo‘qolish/shikast, qaytarish va supplier dispute sinovlari yo‘q. |
| 11. Ishonch va konversiya | Qisman. Bir necha cart/UX taklif bor. Aloqa kanali, haqiqiy review, to‘lov usuli, 30 kunlik jarayon va mobil xaridning amaliy dalillari yetarli emas. |
| 12. Marketing | Qisman. 30 kun va uch video g‘oya bor. Sakkiz kanaldan YouTube Shorts va Email Marketing jadvalda yo‘q. Kanal konversiyasi va CAC raqamlari gipoteza. Video g‘oyalardagi light modes, serializatsiya va boshqa atributlar mahsulot daliliga bog‘lanmagan. |
| 13. Xavfsizlik va maxfiylik | Qisman. Header va ayrim API tekshiruvlari bor. Dossier webhookni HMAC deb ataydi, kod tokenni taqqoslaydi. XSS, CSRF, access control, PII, dependency va haqiqiy provider event qamrovi umumiy `VERIFIED` bahosini ko‘tara olmaydi. |
| 14. Performance, SEO va mobile | Qisman. Robots va sitemap lokal suite’da o‘tgan. Dossierda Lighthouse artefakti, LCP/INP/CLS, product schema va WCAG 2.2 AA bo‘yicha to‘liq dalil yo‘q. Mahsulotning alohida URL sahifasi ham yo‘q. |
| 15–16. Issue formati va hisobotlar | 10/10 fayl bor. Roadmap’da alohida dalil va amaliy tekshirish qadamlari yetishmaydi. Ayrim joriy ochiq muammolar `RESOLVED` deb berilgan. |
| 17–19. Ish bosqichlari va yakuniy missiya | Audit va joriy holat tekshirildi. Tuzatish, production regression va haqiqiy launch tekshiruvi keyingi bosqich hisoblanadi. |

## Lokal dalillar

- **VERIFIED**. Izolyatsiyalangan nusxa, yangi test SQLite bazasi va lokal fixture bilan `npm test` 14/14 o‘tdi. Suite mahalliy order yozuvini tekshiradi. Webhookning update deb nomlangan testi 200 va javobdagi order ID ni tekshiradi, DB’dagi payment statusini o‘qimaydi.
- **VERIFIED**. Lokal API orqali katalogdagi maskaga buyurtma yuborildi. Javob 200, payment `PENDING_GATEWAY`, fulfillment `fallback_simulation`, yo‘nalish `/checkout-success.html`. Receipt 200 qaytardi va HTML jo‘natilgan degan da’voni o‘z ichiga oldi.
- **VERIFIED**. Chromium 156, 390 × 844 mobil emulyatsiyada 4 karta ko‘rindi va gorizontal overflow 0 px bo‘ldi. DOM orqali bir mahsulot savatga qo‘shildi, yetkazish formasi to‘ldirildi va checkout bosildi. Checkout so‘rovlari faqat `/api/checkout` va `/checkout-success.html` bo‘ldi. Receipt `Order Confirmed & Routed`, `Total Paid:` va jo‘natilgan degan xabarni ko‘rsatdi. JavaScript runtime exception qayd etilmadi. Tashqi HTTPS resurslari bloklangan, shuning uchun tashqi rasm, shrift yoki gateway sifatini bu sinov bilan baholab bo‘lmaydi.
- **VERIFIED**. `/about`, `/faq`, `/account`, `/tracking` va maska uchun `/products/<handle>` 200 bilan bosh sahifani qaytardi. Katalog va Quick View bosh sahifada, cart drawer ham shu sahifada. Alohida mavjud statik sahifalar kontakt, yetkazish, qaytarish, maxfiylik, shartlar va receipt.
- **CODE REVIEWED**. HTML/CSS/JS hajmi fayl bo‘yicha 20 025 / 21 967 / 29 883 bayt, jami 71 875 bayt. Tasvir, font va HTTP siqilishi bu hisobga kirmaydi. Dossierdagi individual bundle hajmlari shu commitga mos kelmaydi.
- **NOT TESTED**. Real Safari qurilmasi, to‘qqiz viewportning takroriy to‘liq auditi, Lighthouse, field Web Vitals, WCAG 2.2 AA, staging edge/backup, transactional email va support yetkazilishi.
- **BLOCKED**. Ruxsatli provayder sandbox akkaunti va zarur integratsiya mavjudligi ko‘rsatilmagan. Haqiqiy merchant approval, settlement, chargeback, refund, CJ/qaytarish va tracking uchun provider/supplier dalili hamda mos test muhiti kerak.

## Dossierdagi eng muhim tafovutlar

| ID va daraja | Holat va dalil | Biznes ta’siri va tuzatish | Murakkablik |
| --- | --- | --- | --- |
| V2-PAY-01 · P0 | **VERIFIED**. Lokal katalogdan maska buyurtmasining oddiy happy path’ini yuborib, response va receipt’ni tekshirganda pending payment bilan success sahifa chiqadi. [server.js](../server.js#L574), [checkout-success.html](../public/checkout-success.html#L185) | To‘lov qabul qilinmasa ham xarid tasdiqlanadi va CJ order yaratishga urinish bo‘ladi. Pending order → hosted payment → tasdiqlangan event → idempotent fulfillment ketma-ketligi kerak. | Yuqori |
| V2-SEC-01 · P0 | **CODE REVIEWED**. Webhook va admin access konfiguratsiyalarida kod ichidagi fallback mavjud. Webhook body uchun provider imzosi, summa/valyuta mosligi hamda event idempotency tekshiruvi yo‘q. [server.js](../server.js#L19), [admin va webhook](../server.js#L359) | Buyurtma holati va xaridor ma’lumoti uchun xavf. Standart tokenlarni olib tashlash, tegishli credential’larni rotatsiya qilish, fail-closed provider verifikatsiyasi va secret history audit kerak. `.gitignore` oldingi commitlarni o‘zgartirmaydi. | Yuqori |
| V2-VAL-01 · P1 | **CODE REVIEWED**. Noma’lum katalog mahsulotida klient narxiga va zaxira supplier VID’ga murojaat bor. [server.js](../server.js#L539) | Hisob va jo‘natilgan SKU mos kelmasligi mumkin. Buyurtma tarkibini serverdagi ruxsatli SKU/variant/price bilan qat’iy tekshirish kerak. | O‘rta |
| V2-DB-01 · P1 | **CODE REVIEWED**. Order va item insert alohida yoziladi. Bitta order uchun umumiy transaction ko‘rinmaydi. [db.js](../db.js#L55) | Qisman yozilgan buyurtma qolishi mumkin. Order va item atomik transaction hamda qayta urinish invariantlari kerak. | O‘rta |
| V2-LOG-01 · P1 | **VERIFIED / CODE REVIEWED**. Oddiy lokal buyurtmada simulyatsiya qaytdi. CJ fallback tracking generatsiya qiladi va live branch ichki supplier order-list URL beradi. Pochta indeksi nomi uzatiladigan maydon bilan mos kelmaydi. [server.js](../server.js#L229), [checkout oqimi](../server.js#L574) | Jo‘natish, manzil va tracking xato ko‘rsatilishi mumkin. Xatoni aniq holat sifatida saqlash, indeks mapping va mijozga haqiqiy carrier tracking integratsiyasi kerak. | Yuqori |
| V2-TRUST-01 · P1 | **CODE REVIEWED**. Mahsulot yulduzlari va review soni statik, stock fallback mavjud. Newsletter JS faqat inputni tozalaydi va email yuborilganini yozadi. [public/app.js](../public/app.js#L217), [newsletter](../public/app.js#L673) | Ishonch va email opt-in hisobi buziladi. Tekshirilgan source yoki ishlaydigan opt-in integratsiyasi paydo bo‘lguncha ushbu da’volarni olib tashlash kerak. | O‘rta |
| V2-SEO-01 · P2 | **VERIFIED / CODE REVIEWED**. Mahsulot va yordam URL’lari homepage bilan HTTP 200 oladi. Sitemap’da mahsulot URL’i yo‘q. [server.js](../server.js#L298), [fallback](../server.js#L632) | Deep link, qidiruv indeksatsiyasi va tracking topish qiyinlashadi. Har haqiqiy yo‘nalishga tegishli sahifa, qolganiga 404 kerak. | O‘rta |

## Provayder, bojxona va iqtisod

- **CODE REVIEWED / BLOCKED**. Payoneer receiving account va Payoneer Checkout imkoniyatlari alohida. Rasmiy Checkout sahifasi mustaqil to‘lov mahsulotini va US/Hong Kong entity doirasini ko‘rsatadi. O‘zbekiston subyekti uchun 2Checkout underwriting, reserve, Apple Pay, tarif va payout shartlari bo‘yicha yozma merchant tasdig‘i hali yo‘q. [Payoneer Checkout](https://www.payoneer.com/checkout/) · [2Checkout pricing](https://www.2checkout.com/pricing/) · [Verifone onboarding](https://verifone.cloud/docs/verifone-central/verifone-central/boarding-services/getting-started)
- **Tasdiqlangan hujjatlar**. Logistika va moliya hisobotlaridagi AQShga $800 gacha umumiy bojsiz kirish xulosasi amaldagi rasmiy hujjatga zid. EU modeli uchun 2026-yil 1-iyuldan kam qiymatli jo‘natmalarning tegishli toifalarida €3 vaqtinchalik bojni hisoblash kerak. AQSh va EU tarifini SKU, kelib chiqish mamlakati, tarif kodi va jo‘natish turiga bog‘lash kerak. [AQSh de minimis to‘xtatilishi](https://www.whitehouse.gov/presidential-actions/2026/02/continuing-the-suspension-of-duty-free-de-minimis-treatment-for-all-countries/) · [Yevropa Komissiyasi bojxona yo‘riqnomasi](https://taxation-customs.ec.europa.eu/news/guidance-and-legal-text-temporary-flat-fee-low-value-imports-which-will-apply-until-1-july-2028-2026-06-08_en)
- **INFERRED**. 14–20 kalendar kun, 16–24 kalendar kun va storefront’dagi mintaqaviy transit oynalari o‘zaro moslashtirilmagan. LED maska batareya kimyosi, transport kodi, freight surcharge va ferrofluid tarkibi tasdiqlangan supplier hujjati yoki carrier acceptance bilan yopiladi. 30 kunlik tijoriy kafolatga EU uchun qonuniy 14 kunlik voz kechish huquqi va nuqsonli mahsulot jarayoni alohida yozilishi kerak. [Your Europe qaytarish qoidalari](https://europa.eu/youreurope/citizens/consumers/shopping/returns/index_en.htm)
- **INFERRED**. Maska misolida $118 − $24.50 − $14.20 − $7.08 − $5.90 = **$66.32 reklamagacha contribution**. $42 CAC bilan **$24.32 reklama xarajatidan keyingi contribution**. $11.80 hold bilan dastlabki pul oqimi **$12.52**, uchala natija berilgan taxminlarga bog‘liq. Fixed xarajatlar, soliq va qo‘llanadigan bojlar bilan to‘liq net profit chiqadi. Shu bitta SKU ssenariysida break-even CAC $66.32 va ROAS 1.78×. Executive’dagi 2.2× chegarasi alohida qo‘shimcha xarajat bilan asoslanmagan. 3.5% + $0.35 + 2.5% stavkasi $118 uchun $7.43 beradi, dossierda $7.08 ishlatilgan.

## Auditdan keyingi navbat

1. To‘lov va PII bo‘yicha P0’larni yopish uchun egasining tasdig‘i kerak. Provayder sandboxida success, decline, cancel, muddati o‘tishi, qonuniy takroriy event, refund va status sinxronini tekshirish.
2. SKU/variant/ombor dalili hamda US va tanlangan EU bozorlariga supplier quote, handling va transitni alohida olish. Test buyurtmalarida real tracking, delivery va returns’ni tekshirish.
3. Mavjud sahifalar va copy bo‘yicha evidence inventory, Lighthouse va WCAG dalillari bilan o‘nta hisobotni yangilash. Issue jadvalida dalil, amaliy tekshirish qadami va verification status alohida bo‘lishi kerak.

Ushbu ish muvofiqlik tekshiruvi sifatida bajarildi. Dastur kodi, production konfiguratsiyasi yoki haqiqiy to‘lovlar o‘zgartirilmadi.
