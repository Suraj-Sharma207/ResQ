const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

// Files that configure expo-image-picker's `mediaTypes` option.
const IMAGE_PICKER_FILES = ["app/(tabs)/profile.jsx", "app/editProfile.jsx"];

test("expo-image-picker mediaTypes uses the supported MediaType values", () => {
  const problems = [];

  for (const file of IMAGE_PICKER_FILES) {
    const source = fs.readFileSync(path.join(ROOT, file), "utf8");

    // `MediaTypeOptions` is removed upstream; `MediaType` is a string literal
    // type at runtime, not an object with `.Images`/`.Videos` members.
    if (source.includes("MediaTypeOptions")) {
      problems.push(`${file}: references removed MediaTypeOptions`);
    }
    if (/MediaType\s*[?.]/.test(source)) {
      problems.push(`${file}: accesses MediaType as a runtime enum`);
    }

    const mediaTypeLines = source
      .split("\n")
      .filter((line) => /mediaTypes\s*:/.test(line));

    assert.ok(
      mediaTypeLines.length > 0,
      `${file}: expected a mediaTypes option`
    );

    for (const line of mediaTypeLines) {
      assert.match(
        line,
        /mediaTypes:\s*(\[\s*)?["']images["']/,
        `${file}: mediaTypes must use the 'images' MediaType value: ${line.trim()}`
      );
    }
  }

  assert.deepEqual(problems, [], problems.join(", "));
});
