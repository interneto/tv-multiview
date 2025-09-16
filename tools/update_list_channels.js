#!/usr/bin/env node
/**
 * Update tv-channels.json → split into active/inactive
 * Usage: node tools/update_list_channels.js
 */

const fs = require("fs");
const path = require("path");

const CHANNELS_FILE = path.join(__dirname, "../json-tv/", "tv-channels.json");
const RESULTS_FILE = path.join(__dirname, "../json-tv/", "check_results.json");
const INACTIVE_FILE = path.join(__dirname, "../json-tv/", "inactive.json");

function main() {
  if (!fs.existsSync(CHANNELS_FILE) || !fs.existsSync(RESULTS_FILE)) {
    console.error("❌ Missing input files");
    process.exit(1);
  }

  const channels = JSON.parse(fs.readFileSync(CHANNELS_FILE, "utf8"));
  const results = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf8"));

  const active = {};
  const inactive = {};

  for (const [id, data] of Object.entries(channels)) {
    const isActive = results[id] ?? false;
    if (isActive) {
      active[id] = data;
    } else {
      inactive[id] = data;
    }
  }

  fs.writeFileSync(CHANNELS_FILE, JSON.stringify(active, null, 2), "utf8");
  fs.writeFileSync(INACTIVE_FILE, JSON.stringify(inactive, null, 2), "utf8");

  console.log(`✅ Updated files:`);
  console.log(`  - Active channels → ${CHANNELS_FILE} (${Object.keys(active).length})`);
  console.log(`  - Inactive channels → ${INACTIVE_FILE} (${Object.keys(inactive).length})`);
}

main();
