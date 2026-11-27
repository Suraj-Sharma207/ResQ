const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SOURCE_DIRS = ["app", "components", "hooks", "services", "modules"];
const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);

const EXPECTED_VERSIONS = {
  "expo-audio": "58.0.12",
  "expo-blur": "58.0.6",
  "expo-image-picker": "58.0.10",
  "expo-linear-gradient": "58.0.4",
  "expo-location": "58.0.23",
  "expo-task-manager": "58.0.14",
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
}

function collectSourceFiles(dir) {
  const entries = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(collectSourceFiles(relative));
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(relative);
    }
  }

  return files;
}

test("Expo packages are pinned to the updated API versions", () => {
  const pkg = readJson("package.json");
  const lock = readJson("package-lock.json");

  for (const [name, expected] of Object.entries(EXPECTED_VERSIONS)) {
    const declared = pkg.dependencies[name];
    assert.ok(declared, `${name} should remain a direct dependency`);
    assert.equal(
      declared.replace(/^[~^]/, ""),
      expected,
      `${name} in package.json should be ${expected}`
    );

    const lockedRoot = lock.packages[""].dependencies[name];
    assert.equal(
      lockedRoot.replace(/^[~^]/, ""),
      expected,
      `${name} in the lockfile root should be ${expected}`
    );

    const locked = lock.packages[`node_modules/${name}`];
    assert.ok(locked, `${name} should have a lockfile entry`);
    assert.equal(
      locked.version,
      expected,
      `${name} in package-lock.json should be ${expected}`
    );
  }
});

test("removed Expo APIs are not referenced by application source", () => {
  const removed = [
    "experimentalBlurMethod",
    "getCameraRollPermissionsAsync",
    "useLegacyImplementation",
  ];
  const hits = [];

  for (const dir of SOURCE_DIRS) {
    if (!fs.existsSync(path.join(ROOT, dir))) continue;
    for (const file of collectSourceFiles(dir)) {
      const contents = fs.readFileSync(path.join(ROOT, file), "utf8");
      for (const token of removed) {
        if (contents.includes(token)) {
          hits.push(`${file}: ${token}`);
        }
      }
    }
  }

  assert.deepEqual(hits, [], `removed APIs still referenced: ${hits.join(", ")}`);
});
