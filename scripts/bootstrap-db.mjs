#!/usr/bin/env node
/**
 * Bootstrap PostgreSQL lokal tanpa sudo: mengunduh binary PostgreSQL ke
 * ~/.local/share/marketplace-pg lalu membuat role + database sesuai .env.
 *
 * Pakai: npm run db:bootstrap
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const PG_VERSION = "18.4.0-beta.17";
const PG_PACKAGE = `@embedded-postgres/linux-x64@${PG_VERSION}`;
const PG_ROOT = path.join(homedir(), ".local", "share", "marketplace-pg");
const PG_DATA = path.join(PG_ROOT, "data");
const PG_PASSWORD = process.env.PG_PASSWORD ?? "shopee_dev_password";
const PG_PORT = process.env.PGPORT ?? "5432";
const PG_URL = `postgresql://${process.env.USER ?? "postgres"}:${PG_PASSWORD}@127.0.0.1:${PG_PORT}/postgres`;
const DB_NAME = "shopee_mvp";
const DB_USER = "shopee";

function run(command, args, options = {}) {
  execFileSync(command, args, { stdio: "inherit", ...options });
}

function installBinaries() {
  if (existsSync(path.join(PG_ROOT, "bin", "initdb"))) {
    console.log(`Binary PostgreSQL sudah ada di ${PG_ROOT}`);
    return;
  }

  console.log(`Mengunduh ${PG_PACKAGE}...`);
  const cache = path.join(homedir(), ".npm", "_pgbootstrap");
  mkdirSync(cache, { recursive: true });

  const output = execFileSync("npm", ["pack", PG_PACKAGE, "--pack-destination", cache], {
    cwd: homedir(),
    encoding: "utf8",
  });
  const tarball = path.join(cache, output.trim().split("\n").pop());

  const staging = path.join(cache, "unpacked");
  rmSync(staging, { recursive: true, force: true });
  mkdirSync(staging, { recursive: true });
  run("tar", ["-xzf", tarball, "-C", staging]);

  mkdirSync(PG_ROOT, { recursive: true });
  run("cp", ["-r", path.join(staging, "package", "native", "."), PG_ROOT]);
  console.log(`Binary PostgreSQL terpasang di ${PG_ROOT}`);
}

function hasCluster() {
  return existsSync(path.join(PG_DATA, "PG_VERSION"));
}

async function ensureDatabase() {
  const { default: pg } = await import("pg");

  const client = new pg.Client({ connectionString: PG_URL });
  await client.connect();

  await client.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${DB_USER}') THEN
        CREATE ROLE ${DB_USER} LOGIN PASSWORD '${PG_PASSWORD}' CREATEDB;
      ELSE
        ALTER ROLE ${DB_USER} WITH LOGIN PASSWORD '${PG_PASSWORD}' CREATEDB;
      END IF;
    END $$;
  `);
  console.log(`Role ${DB_USER} siap`);

  const existing = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [DB_NAME]);
  if (existing.rowCount === 0) {
    await client.query(`CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}`);
    console.log(`Database ${DB_NAME} dibuat`);
  } else {
    console.log(`Database ${DB_NAME} sudah ada`);
  }

  await client.end();
}

const PG_SUPERUSER = process.env.USER ?? "postgres";

function startServer() {
  const pgCtl = path.join(PG_ROOT, "bin", "pg_ctl");
  const logFile = path.join(PG_ROOT, "server.log");
  const status = spawnSync(pgCtl, ["-D", PG_DATA, "status"], { stdio: "ignore" });

  if (status.status === 0) {
    console.log("PostgreSQL sudah berjalan");
    return;
  }

  run(pgCtl, ["-D", PG_DATA, "-l", logFile, "-o", `-p ${PG_PORT} -h 127.0.0.1`, "start"]);
}

async function waitForServer(attempts = 30) {
  const { default: pg } = await import("pg");

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const client = new pg.Client({ connectionString: PG_URL });
    try {
      await client.connect();
      await client.end();
      return;
    } catch {
      await client.end().catch(() => {});
      if (attempt === attempts) {
        throw new Error(
          `PostgreSQL tidak siap setelah ${attempts}x percobaan. Cek ${path.join(PG_ROOT, "server.log")}`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

console.log("1/4 Menyiapkan binary PostgreSQL...");
installBinaries();

if (!hasCluster()) {
  console.log("2/4 Membuat cluster data di", PG_DATA);
  const { writeFileSync } = await import("node:fs");
  mkdirSync(PG_DATA, { recursive: true });
  const pwFile = path.join(PG_DATA, "initdb.pw");
  writeFileSync(pwFile, PG_PASSWORD, { mode: 0o600 });
  run(path.join(PG_ROOT, "bin", "initdb"), [
    "-D",
    PG_DATA,
    "-U",
    PG_SUPERUSER,
    "-A",
    "scram-sha-256",
    `--pwfile=${pwFile}`,
    "--encoding=UTF8",
    "--locale=C",
  ]);
  rmSync(pwFile, { force: true });
} else {
  console.log("2/4 Cluster sudah ada, dilewati");
}

console.log("3/4 Menjalankan PostgreSQL lokal...");
startServer();
await waitForServer();

console.log("4/4 Menyiapkan role dan database...");
await ensureDatabase();

console.log("\nSelesai. Lanjutkan dengan:");
console.log("  npm run db:migrate   # terapkan migrasi");
console.log("  npm run db:seed      # isi data demo");
