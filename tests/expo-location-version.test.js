const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const EXPECTED_VERSION = "58.0.23";

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
}

test("expo-location is pinned to the updated release", () => {
  const pkg = readJson("package.json");
  const lock = readJson("package-lock.json");

  const declared = pkg.dependencies["expo-location"];
  assert.ok(declared, "expo-location should remain a direct dependency");
  assert.equal(
    declared.replace(/^[~^]/, ""),
    EXPECTED_VERSION,
    `expo-location in package.json should be ${EXPECTED_VERSION}`
  );

  const lockedRoot = lock.packages[""].dependencies["expo-location"];
  assert.equal(
    lockedRoot.replace(/^[~^]/, ""),
    EXPECTED_VERSION,
    `expo-location in the lockfile root should be ${EXPECTED_VERSION}`
  );

  const locked = lock.packages["node_modules/expo-location"];
  assert.ok(locked, "expo-location should have a lockfile entry");
  assert.equal(
    locked.version,
    EXPECTED_VERSION,
    `expo-location in package-lock.json should be ${EXPECTED_VERSION}`
  );
  assert.match(
    locked.resolved,
    new RegExp(`expo-location-${EXPECTED_VERSION.replace(/\./g, "\\.")}\\.tgz$`),
    "the lockfile should resolve the updated expo-location tarball"
  );
});
