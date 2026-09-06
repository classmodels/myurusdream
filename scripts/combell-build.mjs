import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

process.env.DATABASE_URL ||= "mysql://build:build@127.0.0.1:3306/build";

const generateOnly = process.argv.includes("--generate-only");

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", env: process.env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function generate() {
  if (existsSync("node_modules/prisma/build/index.js")) {
    run("node", ["node_modules/prisma/build/index.js", "generate"]);
    return;
  }
  run("npx", ["--yes", "prisma@6.19.3", "generate"]);
}

generate();
if (generateOnly) process.exit(0);

if (existsSync("node_modules/next/dist/bin/next")) {
  run("node", ["node_modules/next/dist/bin/next", "build"]);
} else {
  run("npx", ["--yes", "next@16.3.3", "build"]);
}
