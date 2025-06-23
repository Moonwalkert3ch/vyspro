import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.GCP_DATABASE_URL,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false, // for GCP SSL
    },
    });

export default pool;
