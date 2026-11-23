import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const dbPath = path.join(process.cwd(), "data", "personas_100k.db");
const db = new DatabaseSync(dbPath);
const totalPersonasRow = db.prepare("SELECT count(*) as total FROM personas").get();
const totalTarget = totalPersonasRow.total;

const endpoints = [
  "/",
  "/api/status",
  "/api/products",
  "/api/products?category=Smart%20Tech%20%26%20Viral%20Gadgets",
  "/products/cyberpunk-led-light-up-winged-mask",
  "/tracking",
  "/faq"
];

const agent = new http.Agent({
  keepAlive: true,
  maxSockets: 100,
  timeout: 15000
});

const statusCounts = {};
let completedCount = 0;
let errorCount = 0;
let totalBytesReceived = 0;
let minLatency = 999999;
let maxLatency = 0;
let sumLatency = 0;
const sampledLatencies = [];

const startTime = Date.now();
const concurrency = 80;
let currentId = 1;

function makeNextRequest(workerResolve) {
  if (currentId > totalTarget) {
    return workerResolve();
  }

  const id = currentId++;
  const targetPath = endpoints[id % endpoints.length];
  const reqStart = Date.now();

  const req = http.request(
    {
      hostname: "localhost",
      port: 3000,
      path: targetPath,
      method: "GET",
      agent,
      headers: {
        "x-stress-test": "100k",
        "x-persona-id": String(id),
        "x-forwarded-for": `10.${(id >> 8) & 255}.${id & 255}.1`,
        "user-agent": `NovaBenchmark/2.0 (Persona-${id})`
      }
    },
    (res) => {
      let bodyLength = 0;
      res.on("data", (chunk) => {
        bodyLength += chunk.length;
      });
      res.on("end", () => {
        const reqDuration = Date.now() - reqStart;
        completedCount++;
        totalBytesReceived += bodyLength;
        statusCounts[res.statusCode] = (statusCounts[res.statusCode] || 0) + 1;

        if (reqDuration < minLatency) minLatency = reqDuration;
        if (reqDuration > maxLatency) maxLatency = reqDuration;
        sumLatency += reqDuration;

        if (id % 20 === 0) {
          sampledLatencies.push(reqDuration);
        }

        if (completedCount % 10000 === 0 || completedCount === totalTarget) {
          const elapsed = (Date.now() - startTime) / 1000;
          const currentRps = (completedCount / elapsed).toFixed(0);
          console.log(`[STRESS_TEST] ${completedCount} / ${totalTarget} (${((completedCount / totalTarget) * 100).toFixed(1)}%) | 200 OK: ${statusCounts[200] || 0} | Errors: ${errorCount} | Speed: ${currentRps} req/s`);
        }

        makeNextRequest(workerResolve);
      });
    }
  );

  req.on("error", (err) => {
    errorCount++;
    completedCount++;
    statusCounts["ERROR"] = (statusCounts["ERROR"] || 0) + 1;
    makeNextRequest(workerResolve);
  });

  req.end();
}

async function runLoadTest() {
  console.log(`Starting Live Storefront Stress-Test for all ${totalTarget} personas...`);
  console.log(`Concurrency: ${concurrency} parallel keep-alive workers across 7 routes.`);

  const workerPromises = [];
  for (let w = 0; w < concurrency; w++) {
    workerPromises.push(new Promise((resolve) => {
      makeNextRequest(resolve);
    }));
  }

  await Promise.all(workerPromises);

  const totalTimeSeconds = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));
  const avgRps = parseFloat((completedCount / totalTimeSeconds).toFixed(1));
  const avgLatency = parseFloat((sumLatency / (completedCount || 1)).toFixed(2));

  sampledLatencies.sort((a, b) => a - b);
  const p50 = sampledLatencies[Math.floor(sampledLatencies.length * 0.50)] || 0;
  const p95 = sampledLatencies[Math.floor(sampledLatencies.length * 0.95)] || 0;
  const p99 = sampledLatencies[Math.floor(sampledLatencies.length * 0.99)] || 0;

  const resultData = {
    testTitle: "100,000 REAL-TRAFFIC LIVE STOREFRONT STRESS-TEST BENCHMARK",
    targetHost: "http://localhost:3000/",
    totalRequests: completedCount,
    concurrency,
    durationSeconds: totalTimeSeconds,
    requestsPerSecond: avgRps,
    statusCodes: statusCounts,
    errorCount,
    successRate: `${(((statusCounts[200] || 0) / completedCount) * 100).toFixed(2)}%`,
    latencyMs: {
      min: minLatency === 999999 ? 0 : minLatency,
      avg: avgLatency,
      p50,
      p95,
      p99,
      max: maxLatency
    },
    totalMegabytesTransferred: parseFloat((totalBytesReceived / (1024 * 1024)).toFixed(2)),
    testedRoutes: endpoints
  };

  const outPath = path.join(process.cwd(), "data", "live_test_100k_results.json");
  fs.writeFileSync(outPath, JSON.stringify(resultData, null, 2), "utf8");

  console.log(`\n======================================================`);
  console.log(`LIVE 100K STRESS-TEST COMPLETED IN ${totalTimeSeconds}s!`);
  console.log(`Throughput: ${avgRps} req/s`);
  console.log(`Success Rate: ${resultData.successRate} (${statusCounts[200] || 0} / ${completedCount})`);
  console.log(`Latency: Avg ${avgLatency}ms | P50 ${p50}ms | P95 ${p95}ms | P99 ${p99}ms`);
  console.log(`Saved report to: ${outPath}`);
  console.log(`======================================================\n`);
}

runLoadTest();
