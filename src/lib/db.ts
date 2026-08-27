import mysql from "mysql2/promise";

declare global {
  var __psiagendaPool: mysql.Pool | undefined;
}

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "psiagenda",
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true,
  });
}

// Reaproveita o pool entre hot-reloads em dev (Next.js recarrega modulos).
const pool = global.__psiagendaPool ?? createPool();
if (process.env.NODE_ENV !== "production") {
  global.__psiagendaPool = pool;
}

export default pool;
