import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { after, before, test } from "node:test";
import { build, createServer } from "vite";
import { createFixture, readBuildArtifacts } from "./fixture.mjs";

const localCanary = "PRIVATE_LOCAL_CANARY_7f8a45d9";
const dependencyCanary = "PRIVATE_DEPENDENCY_CANARY_bed4208c";
let fixture;

before(async () => {
  fixture = await createFixture();
  await writeFile(path.join(fixture.root, "src/data/private-marker.ts"), `export const marker = ${JSON.stringify(dependencyCanary)};\n`);
  await fixture.writeLocal(`
    import demo from "./demo";
    import { marker } from "./private-marker";
    export default {
      ...demo,
      profile: { ...demo.profile, name: ${JSON.stringify(localCanary)} + marker },
      signedOffer: null,
      opportunities: [],
      interviews: []
    };
  `);
});

after(async () => {
  await fixture?.dispose();
});

test("local development loads the opt-in data and handles an absent baseline", async () => {
  const server = await createServer({
    root: fixture.root,
    configFile: fixture.configFile,
    logLevel: "silent",
    server: { middlewareMode: true, watch: null },
    appType: "custom"
  });
  try {
    const { isDemoData } = await server.ssrLoadModule("/src/data/opportunities.ts");
    const lib = await server.ssrLoadModule("/src/lib.ts");
    assert.equal(isDemoData, false);
    assert.equal(lib.data.profile.name, localCanary + dependencyCanary);
    assert.equal(lib.yearOneCash, null);
    assert.equal(lib.recurringCash, null);
    assert.deepEqual(lib.getPortfolioItems(), []);
    assert.deepEqual(lib.getResearchItems(), []);
    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { OfferBaseline } = await server.ssrLoadModule("/src/components/OfferBaseline.tsx");
    assert.doesNotThrow(() => renderToStaticMarkup(createElement(OfferBaseline)));
  } finally {
    await server.close();
  }
});

for (const mode of [undefined, "demo"]) {
  test(`${mode || "default"} production build excludes local data and its transitive dependencies`, async () => {
    const outDir = path.join(fixture.root, `dist-${mode || "default"}`);
    await build({
      root: fixture.root,
      configFile: fixture.configFile,
      ...(mode ? { mode } : {}),
      logLevel: "silent",
      build: { outDir, sourcemap: true }
    });
    const artifacts = await readBuildArtifacts(outDir);
    assert.ok(artifacts.includes("Demo workspace"), "public build must retain the fictional demo dataset");
    assert.ok(!artifacts.includes(localCanary), "private local data appeared in a public build or source map");
    assert.ok(!artifacts.includes(dependencyCanary), "a private transitive import appeared in a public build or source map");
  });
}

test("the explicitly private local-data build is a positive control for the canary test", async () => {
  const outDir = path.join(fixture.root, "dist-local-control");
  await build({
    root: fixture.root,
    configFile: fixture.configFile,
    mode: "local-data",
    logLevel: "silent",
    build: { outDir }
  });
  const artifacts = await readBuildArtifacts(outDir);
  assert.ok(artifacts.includes(localCanary));
  assert.ok(artifacts.includes(dependencyCanary));
});
