import { pgTable, text, varchar, integer, uniqueIndex, boolean, jsonb, serial, index } from "drizzle-orm/pg-core";

export const tokens = pgTable('Tokens', {
    id: serial('id').primaryKey(),
    accountId: varchar('account_id', { length: 256 }),
    token: text('token').notNull(),
    type: varchar('type', { length: 256 }).notNull(),
    ip: varchar('ip', { length: 256 }),
}, (tokens) => {
    return {
        idIndex: uniqueIndex('id_idx').on(tokens.id),
        tokenIndex: uniqueIndex('token_idx').on(tokens.token),
        accountIdIndex: index('account_id_idx').on(tokens.accountId),
        typeIndex: index('type_idx').on(tokens.type),
    }
});

export type Token = typeof tokens.$inferSelect;
export type NewToken = typeof tokens.$inferInsert;