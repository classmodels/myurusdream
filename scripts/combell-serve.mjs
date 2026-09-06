import { spawn } from "node:child_process";

process.env.DATABASE_URL ||= "file:./prod.db";
process.env.NEXT_PUBLIC_SITE_URL ||= "https://myurusdream.be";

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", env: process.env });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited ${code}`));
    });
  });
}

await run("npx", ["prisma", "db", "push"]);
await run("npx", ["tsx", "prisma/seed.ts"]);
await run("npx", [
  "next",
  "start",
  "--hostname",
  "0.0.0.0",
  "--port",
  process.env.PORT || "3000",
]);
