import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const dbPool: Pool = new Pool({
  user: process.env.DBUSER,
  host: process.env.DBHOST,
  database: process.env.DB,
  password: process.env.DBPASSWORD,
  port: Number(process.env.DBPORT),
});

export default dbPool;
