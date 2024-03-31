import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";

import path from 'path';

import Logger from '../aids/logging/logging.utility';
import * as schema from '../models/db/user';

const connection = new Client({
    connectionString: config.databaseUrl,
});
Logger.info('Connecting to database');
export const db = drizzle(connection, { schema } );

const migrationDb = drizzle(connection, { schema });

await connection.connect()

// Test if connection is working
const validate = (await connection.query("SELECT 1"));
if(JSON.stringify(validate).includes('1')) {
    Logger.success('Database connection established');
} else {
    Logger.error('Database connection failed');
}

migrate(migrationDb, { migrationsFolder: path.join(import.meta.dir, '../../drizzle/migrations/') });
