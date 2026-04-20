import { mkdir, readdir, copyFile } from "node:fs/promises";
import { extname, dirname, join, relative } from "node:path";

const SRC_ROOT = "src";
const DIST_ROOT = "dist";
const SHADER_EXTENSIONS = new Set([".vert", ".frag"]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      return [fullPath];
    }),
  );

  return files.flat();
}

async function copyShaderAssets() {
  const files = await walk(SRC_ROOT);
  const shaderFiles = files.filter((filePath) =>
    SHADER_EXTENSIONS.has(extname(filePath).toLowerCase()),
  );

  await Promise.all(
    shaderFiles.map(async (sourcePath) => {
      const relativePath = relative(SRC_ROOT, sourcePath);
      const destinationPath = join(DIST_ROOT, relativePath);
      await mkdir(dirname(destinationPath), { recursive: true });
      await copyFile(sourcePath, destinationPath);
    }),
  );

  console.log(`Copied ${shaderFiles.length} shader file(s) to ${DIST_ROOT}.`);
}

copyShaderAssets().catch((error) => {
  console.error("Failed to copy shader assets:", error);
  process.exitCode = 1;
});
