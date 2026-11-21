# Shopify Partner Development Store & Storefront API (100% Bepul Qo'llanma)

Bu yo'riqnoma orqali hech qanday oylik to'lov ($39/oy) to'lamasdan, umrbod bepul Shopify Development Store ochish va Storefront API kalitlarini olish mumkin.

---

## 1-Qadam: Shopify Partners Akkaunt Ochish (1 daqiqa, $0)
1. Brauzerda [shopify.com/partners](https://www.shopify.com/partners) manziliga kiring.
2. **Join now** (yoki **Sign up**) tugmasini bosing.
3. Google akkaunt yoki email orqali ro'yxatdan o'ting.
4. Biznes nomi so'rasa: `Kravon Studio` yoki ixtiyoriy nom kiriting.

---

## 2-Qadam: Umrbod Bepul Do'kon (Development Store) Yaratish
1. Shopify Partners boshqaruv panelida chap menyudan **Stores** bo'limiga kiring.
2. O'ng tarafdagi **Add store** -> **Create development store** tugmasini bosing.
3. **Store purpose**: `Create a store for a client` yoki `Create a store to test and build` ni tanlang.
4. **Store name**: Masalan `kravon-archive` (do'kon domeni `kravon-archive.myshopify.com` bo'ladi).
5. **Create development store** tugmasini bosing. 
*(Bu do'kon uchun Shopify sizdan hech qachon pul so'ramaydi!)*

---

## 3-Qadam: Storefront API Kalitlarini Olish
1. Yangi ochilgan do'kon boshqaruv panelida (Admin panel):
   - Chap pastdagi **Settings** (Sozlamalar) -> **Apps and sales channels** ga kiring.
2. **Develop apps** (yoki **App development**) tugmasini bosing.
3. **Allow custom app development** ni tasdiqlang.
4. **Create an app** tugmasini bosing:
   - App name: `Kravon Headless Storefront`
5. **Configuration** tabiga o'ting:
   - **Storefront API integration** yonidagi **Configure** tugmasini bosing.
   - Kerakli ruxsatlarni (Scopes) yoqing:
     - `unauthenticated_read_product_listings`
     - `unauthenticated_read_product_inventory`
     - `unauthenticated_write_checkouts`
     - `unauthenticated_read_checkouts`
     - `unauthenticated_write_customers`
   - **Save** tugmasini bosing.
6. **API credentials** tabiga o'ting:
   - **Install app** tugmasini bosing.
   - **Storefront API access token** ni ko'chirib oling (`shpat_...` yoki `...`).

---

## 4-Qadam: Kalitlarni Saytga Ulash
Olingan ma'lumotlarni `/root/shopify-storefront/.env` fayliga yozasiz:

```env
PORT=3000
SHOPIFY_STORE_DOMAIN=kravon-archive.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=siz_olgan_token
SHOPIFY_API_VERSION=2024-10
```

Shu bilan saytimiz bevosita sizning Shopify do'koningizga ulanadi va real checkout rejimiga o'tadi.
