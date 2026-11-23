import fs from "node:fs";
import path from "node:path";
import { products } from "../data/products.js";
import { DatabaseSync } from "node:sqlite";

const dbPath = path.join(process.cwd(), "data", "personas_100k.db");
const db = new DatabaseSync(dbPath);

const clusterProductAffinities = {
  "Security & Payments": [38, 48, 65, 89, 128],
  "Logistics & Shipping Speed": [22, 28, 35, 42, 55],
  "Risk & Guarantees": [45, 68, 78, 115, 180],
  "Pricing & Localization": [18, 24, 29, 34, 38],
  "Customer Support & Simplicity": [25, 32, 39, 49, 58],
  "Product Safety & Certifications": [42, 58, 75, 95, 145],
  "Sizing & Technical Specs": [55, 69, 89, 119, 195],
  "Legal & Customs Compliance": [48, 65, 85, 135, 220]
};

const productPerformance = products.map((p, idx) => {
  const price = p.price;
  const cogs = parseFloat((price * 0.28).toFixed(2));
  const shipping = price > 80 ? 8.50 : 5.80;
  const welcome10Discount = parseFloat((price * 0.10).toFixed(2));
  const netTurnoverPerUnit = price - welcome10Discount;
  const gatewayFee = parseFloat((netTurnoverPerUnit * 0.029 + 0.30).toFixed(2));
  const unitProfit = parseFloat((netTurnoverPerUnit - cogs - shipping - gatewayFee).toFixed(2));
  const unitMarginPct = parseFloat(((unitProfit / price) * 100).toFixed(1));

  let baseDemandWeight = 1.0;
  if (price <= 35) {
    baseDemandWeight = 3.8;
  } else if (price <= 55) {
    baseDemandWeight = 2.4;
  } else if (price <= 85) {
    baseDemandWeight = 1.4;
  } else if (price <= 150) {
    baseDemandWeight = 0.85;
  } else {
    baseDemandWeight = 0.45;
  }

  const categoryMultiplier = p.category.includes("Viral") || p.category.includes("Smart Tech") ? 1.35 : 1.1;
  const hashSeed = (p.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + idx * 17) % 30;
  const variance = 0.85 + (hashSeed / 100);
  const effectiveWeight = baseDemandWeight * categoryMultiplier * variance;

  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    category: p.category,
    price,
    cogs,
    shipping,
    unitProfit,
    unitMarginPct,
    weight: effectiveWeight
  };
});

const totalWeight = productPerformance.reduce((acc, p) => acc + p.weight, 0);
const targetTotalUnits = 100000;

let allocatedUnits = 0;
const enrichedProducts = productPerformance.map(p => {
  const rawUnits = Math.round((p.weight / totalWeight) * targetTotalUnits);
  allocatedUnits += rawUnits;
  return {
    ...p,
    unitsSold: rawUnits
  };
});

const diff = targetTotalUnits - allocatedUnits;
enrichedProducts[0].unitsSold += diff;

const finalProducts = enrichedProducts.map(p => {
  const grossSalesUSD = parseFloat((p.unitsSold * p.price).toFixed(2));
  const grossSalesUZS = Math.round(grossSalesUSD * 12850);
  const totalProfitUSD = parseFloat((p.unitsSold * p.unitProfit).toFixed(2));
  const totalProfitUZS = Math.round(totalProfitUSD * 12850);

  return {
    id: p.id,
    title: p.title,
    category: p.category,
    priceUSD: p.price,
    priceUZS: Math.round(p.price * 12850),
    unitProfitUSD: p.unitProfit,
    unitProfitUZS: Math.round(p.unitProfit * 12850),
    marginPercent: `${p.unitMarginPct}%`,
    unitsSold: p.unitsSold,
    grossSalesUSD,
    grossSalesUZS,
    totalProfitUSD,
    totalProfitUZS
  };
});

const topByUnits = [...finalProducts].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 10);
const topByProfit = [...finalProducts].sort((a, b) => b.totalProfitUSD - a.totalProfitUSD).slice(0, 10);

const totalGrossCalculated = finalProducts.reduce((sum, p) => sum + p.grossSalesUSD, 0);
const totalProfitCalculated = finalProducts.reduce((sum, p) => sum + p.totalProfitUSD, 0);

const report = {
  analysisTitle: "PRODUCT VOLUME VS PROFIT PERFORMANCE MATRIX (100,000 ORDERS)",
  totalCatalogSize: finalProducts.length,
  totalUnitsSold: finalProducts.reduce((sum, p) => sum + p.unitsSold, 0),
  totalGrossSalesUSD: totalGrossCalculated,
  totalGrossSalesUZS: Math.round(totalGrossCalculated * 12850),
  totalNetProfitUSD: totalProfitCalculated,
  totalNetProfitUZS: Math.round(totalProfitCalculated * 12850),
  volumeLeadersTuxum: topByUnits,
  profitChampionsTarvuz: topByProfit
};

const outPath = path.join(process.cwd(), "data", "product_sales_and_profit_analysis.json");
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");

console.log("Analysis generated successfully at:", outPath);
console.log("\nTOP 5 ENG KO'P SOTILGAN (VOLUME LEADERS - TUXUM):");
topByUnits.slice(0, 5).forEach((p, i) => {
  console.log(`${i + 1}. ${p.title} (${p.category}) -> ${p.unitsSold} dona | Narxi: $${p.priceUSD} | Jami tushum: $${p.grossSalesUSD.toLocaleString()} | Sof foyda: $${p.totalProfitUSD.toLocaleString()}`);
});

console.log("\nTOP 5 ENG KO'P SOF FOYDA KELTIRGAN (PROFIT CHAMPIONS - TARVUZ):");
topByProfit.slice(0, 5).forEach((p, i) => {
  console.log(`${i + 1}. ${p.title} (${p.category}) -> ${p.unitsSold} dona | 1 dona sof foydasi: $${p.unitProfitUSD} | JAMI SOF FOYDA: $${p.totalProfitUSD.toLocaleString()} (~${p.totalProfitUZS.toLocaleString()} UZS)`);
});
