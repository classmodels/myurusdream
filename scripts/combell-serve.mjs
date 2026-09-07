import { existsSync } from "node:fs";
import { spawn } from "node:child_process";

process.env.NEXT_PUBLIC_SITE_URL ||= "https://myurusdream.be";
process.env.CI = "true";

if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith("mysql")) {
  console.error("DATABASE_URL must be a mysql:// connection string from Combell.");
  process.exit(1);
}

if (!process.env.DATABASE_URL.includes("sslaccept=")) {
  process.env.DATABASE_URL += (process.env.DATABASE_URL.includes("?") ? "&" : "?") + "sslaccept=accept_invalid_certs";
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", env: process.env });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited ${code}`));
    });
  });
}

function prismaArgs(args) {
  if (existsSync("node_modules/prisma/build/index.js")) {
    return ["node", ["node_modules/prisma/build/index.js", ...args]];
  }
  return ["npx", ["--yes", "prisma@6.19.3", ...args]];
}

function tsxArgs(args) {
  if (existsSync("node_modules/tsx/dist/cli.mjs")) {
    return ["node", ["node_modules/tsx/dist/cli.mjs", ...args]];
  }
  return ["npx", ["tsx", ...args]];
}

const [prismaCmd, prismaCmdArgs] = prismaArgs([
  "db",
  "push",
  "--skip-generate",
  "--accept-data-loss",
]);
await run(prismaCmd, prismaCmdArgs);

const [tsxCmd, tsxCmdArgs] = tsxArgs(["prisma/seed.ts"]);
await run(tsxCmd, tsxCmdArgs);

if (existsSync("scripts/launch-cleanup.mjs")) {
  console.log("Running one-shot launch cleanup…");
  try {
    await run("node", ["scripts/launch-cleanup.mjs"]);
  } catch (error) {
    console.error("launch cleanup failed (continuing serve):", error);
  }
}

const nextBin = existsSync("node_modules/next/dist/bin/next")
  ? ["node", ["node_modules/next/dist/bin/next", "start", "--hostname", "0.0.0.0", "--port", process.env.PORT || "3000"]]
  : ["npx", ["next", "start", "--hostname", "0.0.0.0", "--port", process.env.PORT || "3000"]];

await run(nextBin[0], nextBin[1]);
