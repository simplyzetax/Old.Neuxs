import type { Config } from 'drizzle-kit';

export default {
    schema: ["./src/models/db/user.ts", "./src/models/db/schema.ts", "./src/models/db/token.ts"],
    out: './drizzle/migrations',
    driver: 'pg', // 'pg' | 'mysql2' | 'better-sqlite' | 'libsql' | 'turso'
    dbCredentials: {
        host: "49.12.102.87",
        user: "finn",
        password: "Chaosfloh44",
        database: "nexus",
    },
} satisfies Config;