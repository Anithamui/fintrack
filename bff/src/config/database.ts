import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  password: "1234",
  host: "localhost",
  port: 5432,
  database: "fintrack_db",
});

pool.on("error", (err: Error) => {
  console.error("Unexpected error on idle client", err);
});

export default pool;
