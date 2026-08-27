import { readFileSync, readdirSync } from "fs";
import path from "path";
import mysql from "mysql2/promise";
import "dotenv/config";

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    multipleStatements: true,
  });

  const dbName = process.env.DB_NAME ?? "psiagenda";
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.changeUser({ database: dbName });

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    console.log(`Aplicando migration: ${file}`);
    const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    await connection.query(sql);
  }

  console.log("Migrations aplicadas com sucesso.");
  await connection.end();
}

main().catch((err) => {
  console.error("Falha ao rodar migrations:", err);
  process.exit(1);
});
