import { pgTable, text, varchar, integer, uniqueIndex, boolean, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable('Users', {
    accountId: varchar('account_id', { length: 256 }).primaryKey(),
    username: varchar('displayname', { length: 256 }).notNull(),
    usernameLower: varchar('displayname_lower', { length: 256 }).notNull(),
    discordId: varchar('discord_id', { length: 256 }).notNull(),
    email: varchar('email', { length: 256 }).notNull(),
    password: text('password').notNull(),
    reports: integer('reports'),
    banned: boolean('banned').default(false),
}, (users) => {
    return {
        displayNameIndex: uniqueIndex('displayName_idx').on(users.username),
        displayNameLowerIndex: uniqueIndex('displayName_lower_idx').on(users.usernameLower),
        discordIdIndex: uniqueIndex('discord_id_idx').on(users.discordId),
        emailIndex: uniqueIndex('email_idx').on(users.email),
    }
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;