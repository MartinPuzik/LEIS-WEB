import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const siteRoot = fileURLToPath(new URL("../", import.meta.url));
const publicRoot = path.join(siteRoot, "public");

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex").toUpperCase();
}

test("builds the current multilingual LEIS Portal", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(path.join(siteRoot, "app", "page.tsx"), "utf8"),
    readFile(path.join(siteRoot, "app", "layout.tsx"), "utf8"),
    readFile(path.join(siteRoot, "package.json"), "utf8"),
    access(path.join(siteRoot, "dist", "server", "index.js")),
    access(path.join(siteRoot, "dist", "client")),
  ]);

  assert.match(page, /type Language = "en" \| "cs" \| "de" \| "fr" \| "es"/);
  assert.match(page, /\["public release", releaseCopy\]/);
  assert.match(page, /id="release"/);
  assert.match(page, /98 of 98 deterministic local protocol cases passed/);
  assert.match(page, /No claim of identical internal understanding/);
  assert.match(layout, /LEIS — Understanding that can travel/);
  assert.match(packageJson, /"next": "\^16\.3\.1"/);
});

test("ships the evidence-bounded release in all five Portal languages", async () => {
  const page = await readFile(path.join(siteRoot, "app", "page.tsx"), "utf8");

  assert.match(page, /LEIS Portable Kernel v3\.0\.1 is ready to inspect/);
  assert.match(page, /LEIS Portable Kernel v3\.0\.1 je připraven ke kontrole/);
  assert.match(page, /LEIS Portable Kernel v3\.0\.1 kann jetzt geprüft werden/);
  assert.match(page, /LEIS Portable Kernel v3\.0\.1 est prêt à être examiné/);
  assert.match(page, /LEIS Portable Kernel v3\.0\.1 está listo para revisión/);

  await Promise.all([
    access(path.join(publicRoot, "releases", "LEIS-V3.0.1-PUBLIC.zip")),
    access(path.join(publicRoot, "releases", "v3.0.1", "MANIFEST.json")),
    access(path.join(publicRoot, "releases", "v3.0.1", "LEIS-PORTABLE-KERNEL-V3.0.1.md")),
    access(path.join(publicRoot, ".well-known", "leis.json")),
    access(path.join(publicRoot, "llms.txt")),
  ]);
});

test("uses the Portable Kernel as the single public onboarding file", async () => {
  const page = await readFile(path.join(siteRoot, "app", "page.tsx"), "utf8");

  assert.match(page, /Take the LEIS Portable Kernel with you/);
  assert.match(page, /K zahájení stačí jediný soubor Markdown/);
  assert.match(page, /files: \[\["Portable Kernel \(\.md\)"/);
  assert.doesNotMatch(page, /files: \[\["Root Seed \(\.md\)"/);
  assert.match(page, /JSON manifest slouží ke kontrole integrity, nikoli ke spuštění LEIS/);
  assert.match(page, /The older Root Seed remains in the lineage archive/);
});

test("publishes a privacy-bounded foundation information map", async () => {
  const [page, foundation] = await Promise.all([
    readFile(path.join(siteRoot, "app", "page.tsx"), "utf8"),
    readFile(path.join(publicRoot, "foundation", "LEIS-FOUNDATION-START-HERE-V1.0-CS.md"), "utf8"),
  ]);

  assert.match(page, /href="\/foundation\/LEIS-FOUNDATION-START-HERE-V1\.0-CS\.md"/);
  assert.match(page, /Podklady pro nadační fond/);
  assert.match(foundation, /nejde o zakladatelske pravni jednani, podani, pravni radu ani potvrzeni registrace/);
  assert.match(foundation, /Soukrome listiny pro zamysleny Nadacni fond LEIS se sem neumistuji/);
  assert.match(foundation, /Nadacni fond vznikne az zapisem do verejneho rejstriku/);
  assert.doesNotMatch(foundation, /O-612809/);
});

test("matches every v3.0.1 manifest entry and the approved release ZIP", async () => {
  const releaseRoot = path.join(publicRoot, "releases", "v3.0.1");
  const manifest = JSON.parse(await readFile(path.join(releaseRoot, "MANIFEST.json"), "utf8"));
  assert.equal(manifest.release, "LEIS Portable Kernel v3.0.1");
  assert.equal(manifest.state, "PUBLIC_RELEASE");
  assert.deepEqual(manifest.suite, {
    cases: 98,
    passed: 98,
    scope: "deterministic local protocol conformance",
  });

  for (const entry of manifest.files) {
    const filePath = path.resolve(releaseRoot, entry.path);
    assert.ok(filePath.startsWith(`${path.resolve(releaseRoot)}${path.sep}`));
    const [bytes, details] = await Promise.all([readFile(filePath), stat(filePath)]);
    assert.equal(details.size, entry.bytes, `${entry.path}: byte length`);
    assert.equal(sha256(bytes), entry.sha256, `${entry.path}: SHA-256`);
  }

  const archive = await readFile(path.join(publicRoot, "releases", "LEIS-V3.0.1-PUBLIC.zip"));
  assert.equal(sha256(archive), "7C9748DD4C1B657622CF2669BF658DAC4CA786178ADED5FD6FFE29A59B68D889");
});
