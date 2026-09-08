import { cp, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const projectRoot = fileURLToPath(new URL("../", import.meta.url));

/** Never read, replace, or build from the developer's private data file. */
export async function createFixture() {
  const root = await mkdtemp(path.join(tmpdir(), "job-board-test-"));
  try {
    for (const entry of ["src", "styles.css", "index.html", "favicon.svg", "vite.config.ts", "package.json"]) {
      await cp(path.join(projectRoot, entry), path.join(root, entry), {
        recursive: true,
        filter: (source) => !path.basename(source).includes(".local.")
      });
    }
    await symlink(path.join(projectRoot, "node_modules"), path.join(root, "node_modules"), "dir");
    return {
      root,
      configFile: path.join(root, "vite.config.ts"),
      writeLocal: (source) => writeFile(path.join(root, "src/data/opportunities.local.ts"), source),
      dispose: () => rm(root, { recursive: true, force: true, maxRetries: 3 })
    };
  } catch (error) {
    await rm(root, { recursive: true, force: true });
    throw error;
  }
}

export async function readBuildArtifacts(directory) {
  const contents = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const location = path.join(directory, entry.name);
    if (entry.isDirectory()) contents.push(await readBuildArtifacts(location));
    else contents.push(await readFile(location, "utf8"));
  }
  return contents.join("\n");
}
