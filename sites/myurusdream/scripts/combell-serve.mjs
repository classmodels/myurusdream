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

// Add new columns/tables only. Never --accept-data-loss: that dropped live
// payments/sponsors on every Combell restart when Prisma saw a type mismatch.
const [prismaCmd, prismaCmdArgs] = prismaArgs(["db", "push", "--skip-generate"]);
await run(prismaCmd, prismaCmdArgs);

const nextBin = existsSync("node_modules/next/dist/bin/next")
  ? ["node", ["node_modules/next/dist/bin/next", "start", "--hostname", "0.0.0.0", "--port", process.env.PORT || "3000"]]
  : ["npx", ["next", "start", "--hostname", "0.0.0.0", "--port", process.env.PORT || "3000"]];

await run(nextBin[0], nextBin[1]);
