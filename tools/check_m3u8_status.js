/**
 * Check and update M3U8 links in tv-channels.json using iptv-checker
 * Generates detailed report of working and failed links
 *
 * Usage:
 *   node tools/check_m3u8_status.js [--update-json] [--limit=10]
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

// Paths
const JSON_FILE_PATH = path.join(__dirname, "..", "json-tv", "tv-channels.json");
const TEMP_M3U_PATH = path.join(os.tmpdir(), "temp-m3u-for-checking.m3u");
const RESULTS_FILE = path.join(os.tmpdir(), "iptv-checker-results.json");
const REPORT_FILE = path.join(__dirname, "..", "m3u8_check_report.txt");

// CLI arguments
const UPDATE_JSON = process.argv.includes("--update-json");
const limitArg = process.argv.find(arg => arg.startsWith("--limit="));
const LIMIT = limitArg ? parseInt(limitArg.split("=")[1], 10) : Infinity;

// Helpers
const log = (msg, prefix = "ℹ️") => console.log(`${prefix} ${msg}`);
const error = (msg) => console.error(`❌ ${msg}`);

function extractM3u8Links() {
  log("Reading tv-channels.json...");
  const jsonData = JSON.parse(fs.readFileSync(JSON_FILE_PATH, "utf8"));
  const links = [];

  for (const [channelId, channel] of Object.entries(jsonData)) {
    const urls = channel?.signals?.m3u8_url || [];
    urls.forEach((url, index) => {
      if (url && url.trim() !== "") {
        links.push({
          channelId,
          name: channel.name || channelId,
          url,
          country: channel.country || "unknown",
          index,
        });
      }
    });
    if (links.length >= LIMIT) break;
  }

  log(`Found ${links.length} links (testing ${Math.min(LIMIT, links.length)})`);
  return { links: links.slice(0, LIMIT), jsonData };
}

function createTempM3uFile(links) {
  log(`Creating temporary M3U file → ${TEMP_M3U_PATH}`);
  const lines = ["#EXTM3U"];
  for (const link of links) {
    lines.push(
      `#EXTINF:-1 tvg-id="${link.channelId}:${link.index}" tvg-country="${link.country}",${link.name}`,
      link.url
    );
  }
  fs.writeFileSync(TEMP_M3U_PATH, lines.join("\n"), "utf8");
  log(`Temporary M3U file created with ${links.length} channels`);
}

function runIptvChecker() {
  log("Running iptv-checker...");
  const command = [
    "npx",
    "iptv-checker",
    "--timeout 10000",
    `--user-agent "Mozilla/5.0"`,
    `--output "${RESULTS_FILE}"`,
    `"${TEMP_M3U_PATH}"`,
  ].join(" ");

  try {
    log(`Executing: ${command}`);
    const stdout = execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    log("iptv-checker finished ✅");
    return stdout;
  } catch (err) {
    error("iptv-checker failed");
    return err.stdout ? String(err.stdout) : "";
  }
}

function parseResults(checkerStdout) {
  if (fs.existsSync(RESULTS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(RESULTS_FILE, "utf8"));
    } catch (e) {
      error(`Failed to parse ${RESULTS_FILE}: ${e.message}`);
    }
  }
  if (checkerStdout) {
    try {
      return JSON.parse(checkerStdout);
    } catch {
      const s = checkerStdout;
      const start = s.indexOf("{");
      const end = s.lastIndexOf("}");
      if (start !== -1 && end > start) {
        try {
          return JSON.parse(s.substring(start, end + 1));
        } catch {
          /* ignore */
        }
      }
    }
  }
  return null;
}

function generateReport(results, jsonData) {
  const now = new Date().toLocaleString();
  let report = [
    "============================================================",
    "M3U8 LINK CHECK REPORT",
    `Generated: ${now}`,
    `Limit: ${LIMIT < Infinity ? LIMIT : "All"}`,
    "============================================================",
    "",
  ].join("\n");

  if (!results?.playlist?.items) {
    report += "No results available.\n";
    fs.writeFileSync(REPORT_FILE, report, "utf8");
    log(`Report saved to ${REPORT_FILE}`);
    return;
  }

  const items = results.playlist.items;
  const online = items.filter(i => i.status === "online");
  const offline = items.filter(i => i.status !== "online");

  report += `TOTAL LINKS: ${items.length}\n`;
  report += `ONLINE: ${online.length}\n`;
  report += `OFFLINE: ${offline.length}\n`;
  report += `SUCCESS RATE: ${((online.length / items.length) * 100).toFixed(1)}%\n\n`;

  if (online.length) {
    report += "============================================================\n";
    report += "✅ ONLINE LINKS\n";
    report += "============================================================\n\n";
    online.forEach((l, i) => {
      report += `${i + 1}. ${l.name}\n   URL: ${l.url}\n   Bitrate: ${l.bitrate || "N/A"}\n   Resolution: ${l.resolution || "N/A"}\n   Duration: ${l.duration || "N/A"}\n\n`;
    });
  }

  if (offline.length) {
    report += "============================================================\n";
    report += "❌ OFFLINE LINKS\n";
    report += "============================================================\n\n";
    offline.forEach((l, i) => {
      report += `${i + 1}. ${l.name}\n   URL: ${l.url}\n   Error: ${l.error || "Unknown"}\n\n`;
    });
  }

  fs.writeFileSync(REPORT_FILE, report, "utf8");
  log(`Report saved to ${REPORT_FILE}`);

  if (UPDATE_JSON && jsonData) {
    jsonData._metadata = {
      ...(jsonData._metadata || {}),
      lastChecked: new Date().toISOString(),
      checkerVersion: "iptv-checker",
    };
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(jsonData, null, 2), "utf8");
    log(`Updated JSON metadata in ${JSON_FILE_PATH}`);
  }
}

function cleanup() {
  if (fs.existsSync(TEMP_M3U_PATH)) fs.unlinkSync(TEMP_M3U_PATH);
}

// Main
(function main() {
  console.log(
    `\n📺 M3U8 LINK CHECK REPORT GENERATOR\nTesting: ${LIMIT < Infinity ? `${LIMIT} links` : "all links"}\nReport: ${REPORT_FILE}\n`
  );
  try {
    const { links, jsonData } = extractM3u8Links();
    if (!links.length) {
      error("No links found in tv-channels.json");
      return;
    }
    createTempM3uFile(links);
    const stdout = runIptvChecker();
    const results = parseResults(stdout);
    generateReport(results, jsonData);
  } catch (err) {
    error(err.message || err);
  } finally {
    cleanup();
  }
})();
