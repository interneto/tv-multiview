#!/usr/bin/env node
/**
 * Report status of channels (M3U8 links).
 * Usage: node tools/report_status_channels.js [--limit=10] [--timeout=15000]
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

const DEFAULT_LIMIT = Infinity;
const DEFAULT_TIMEOUT = 15000;

// CLI args
const limitArg = process.argv.find(arg => arg.startsWith("--limit="));
const timeoutArg = process.argv.find(arg => arg.startsWith("--timeout="));
const LIMIT = limitArg ? parseInt(limitArg.split("=")[1], 10) : DEFAULT_LIMIT;
const TIMEOUT = timeoutArg ? parseInt(timeoutArg.split("=")[1], 10) : DEFAULT_TIMEOUT;

// Paths
const JSON_FILE = path.join(__dirname, "../json-tv/", "tv-channels.json");
const REPORT_FILE = path.join(__dirname, "../json-tv/", "m3u8_check_report.txt");
const RESULTS_FILE = path.join(__dirname, "../json-tv/", "check_results.json");

function checkUrl(url, timeout) {
  return new Promise((resolve) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(url, { timeout, method: "GET" }, (res) => {
      const status = res.statusCode;
      resolve(status >= 200 && status < 400);
      req.destroy();
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log("📡 Checking channel links...");

  const channels = JSON.parse(fs.readFileSync(JSON_FILE, "utf8"));
  const results = {};
  const details = {}; // store tested urls per channel

  let total = 0;
  for (const [id, data] of Object.entries(channels)) {
  const urls = Array.isArray(data?.signals?.m3u8_url) ? data.signals.m3u8_url.slice() : [];
  // also include signals.url if present
  if (data?.signals?.url && typeof data.signals.url === 'string') urls.push(data.signals.url);
  details[id] = urls.slice();
  for (const url of urls) {
      if (LIMIT !== Infinity && total >= LIMIT) break;

      console.log(`🔗 Testing: ${id} → ${url}`);
      const ok = await checkUrl(url, TIMEOUT);
  results[id] = ok;
      total++;
    }
    if (LIMIT !== Infinity && total >= LIMIT) break;
  }

  // Save results JSON
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2), "utf8");

  // Generate report text
  let report = [
    "============================================================",
    "M3U8 CHANNEL STATUS REPORT",
    `Generated: ${new Date().toLocaleString()}`,
    `Checked: ${total} links`,
    "============================================================",
    ""
  ].join("\n");

  const active = Object.entries(results).filter(([_, v]) => v);
  const inactive = Object.entries(results).filter(([_, v]) => !v);

  report += `Active: ${active.length}\nInactive: ${inactive.length}\n\n`;

  if (active.length) {
    report += "## ✅ ACTIVE CHANNELS:\n";
    active.forEach(([id]) => {
      report += `- ${id}`;
      const urls = details[id] || [];
      urls.forEach(u => report += ` - <${u}>\n`);
    });
    report += "\n";
  }
  if (inactive.length) {
    report += "##  ❌ INACTIVE CHANNELS:\n";
    inactive.forEach(([id]) => {
      report += `- ${id}`;
      const urls = details[id] || [];
      urls.forEach(u => report += ` - <${u}>\n`);
    });
    report += "\n";
  }

  fs.writeFileSync(REPORT_FILE, report, "utf8");
  console.log(`\n📝 Report saved to ${REPORT_FILE}`);
  console.log(`📊 Raw results saved to ${RESULTS_FILE}`);
}

main().catch((err) => {
  console.error("❌ Error:", err.message || err);
});
