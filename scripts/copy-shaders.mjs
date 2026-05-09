import {
  mkdir,
  readdir,
  copyFile,
  readFile,
  writeFile,
} from "node:fs/promises";
import { extname, dirname, join, relative, resolve } from "node:path";

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

async function inlineRawShaderImports() {
  const files = await walk(DIST_ROOT);
  const jsFiles = files.filter((filePath) => filePath.endsWith(".js"));
  const rawImportRegex =
    /import\s+(\w+)\s+from\s+["'](.+?\.(?:frag|vert))\?raw["'];?/g;

  let updatedFiles = 0;

  await Promise.all(
    jsFiles.map(async (jsFilePath) => {
      const original = await readFile(jsFilePath, "utf8");
      let modified = original;
      let changed = false;

      const matches = Array.from(original.matchAll(rawImportRegex));
      for (const match of matches) {
        const variableName = match[1];
        const relativeShaderPath = match[2];
        const absoluteShaderPath = resolve(
          dirname(jsFilePath),
          relativeShaderPath,
        );
        const shaderSource = await readFile(absoluteShaderPath, "utf8");
        const replacement = `const ${variableName} = ${JSON.stringify(shaderSource)};`;
        modified = modified.replace(match[0], replacement);
        changed = true;
      }

      if (changed) {
        await writeFile(jsFilePath, modified, "utf8");
        updatedFiles += 1;
      }
    }),
  );

  console.log(`Inlined shader raw imports in ${updatedFiles} file(s).`);
}

Promise.resolve()
  .then(copyShaderAssets)
  .then(inlineRawShaderImports)
  .catch((error) => {
    console.error("Failed to prepare shader assets:", error);
    process.exitCode = 1;
  });
