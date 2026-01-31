const { execSync } = require("child_process");
const { writeFileSync, mkdirSync } = require("fs");
const { join } = require("path");

const timestamp = new Date()
  .toISOString()
  .replace(/\D/g, "")
  .slice(0, 14);

let build = `local.${timestamp}`;
try {
  const gitCount = execSync("git rev-list --count HEAD", {
    stdio: ["ignore", "pipe", "ignore"],
  })
    .toString()
    .trim();
  if (gitCount) {
    build = `${gitCount}.${timestamp}`;
  }
} catch (_) {
  // keep "local" if git is unavailable
}

const content = `export const BUILD_VERSION = "${build}";\n`;

const outDir = join(__dirname, "..", "src");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "build.ts"), content, "utf8");
