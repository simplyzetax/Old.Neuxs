import { pgTable, text, varchar, integer, uniqueIndex, boolean, jsonb, index } from "drizzle-orm/pg-core";

export const Profiles = pgTable('Profiles', {
    id: varchar('id', { length: 256 }).primaryKey(),
    accountId: varchar('account_id', { length: 256 }).notNull(),
    type: varchar('type', { length: 256 }).notNull(),
    revision: integer('revision').notNull(),
}, (profiles) => {
    return {
        accountIdIndex: uniqueIndex('accountId_idx').on(profiles.accountId),
        idIndex: uniqueIndex('id_idx').on(profiles.id),
    }
});

export type Profile = typeof Profiles.$inferSelect;
export type NewProfile = typeof Profiles.$inferInsert;

export const Items = pgTable('Items', {
    id: varchar('id', { length: 256 }).primaryKey(),
    profileId: varchar('profile_id', { length: 256 }).notNull(),
    templateId: varchar('template_id', { length: 256 }).notNull(),
    quantity: integer('quantity').notNull(),
    favorite: boolean('favorite').default(false),
    seen: boolean('has_seen').default(false),
}, (users) => {
    return {
        idIndex: uniqueIndex('id_idx').on(users.id),
    }
});

export type Item = typeof Items.$inferSelect;
export type NewItem = typeof Items.$inferInsert;

export const Gifts = pgTable('Gifts', {
    id: varchar('id', { length: 256 }).primaryKey(),
    profileId: varchar('profile_id', { length: 256 }).notNull(),
    templateId: varchar('template_id', { length: 256 }).notNull(),
    quantity: integer('quantity').notNull(),
    fromId: varchar('from_id', { length: 256 }).notNull(),
    giftedAt: integer('gifted_at').notNull(),
    message: text('message').notNull(),
});

export type Gift = typeof Gifts.$inferSelect;
export type NewGift = typeof Gifts.$inferInsert;

export const Loadouts = pgTable(
	"Loadouts",
	{
		id: varchar("id", { length: 256 }).primaryKey(),
		profileId: varchar("profile_id", { length: 256 }).notNull(),
		templateId: varchar("template_id", { length: 256 }).notNull(),
		lockerName: varchar("locker_name", { length: 256 }).notNull(),
		bannerId: varchar("banner_id", { length: 256 }).notNull(),
		bannerColorId: varchar("banner_color_id", { length: 256 }).notNull(),
		characterId: varchar("character_id", { length: 256 }).notNull(),
		backpackId: varchar("backpack_id", { length: 256 }).notNull(),
		gliderId: varchar("glider_id", { length: 256 }).notNull(),
		danceId: jsonb("dance_id").notNull(),
		pickaxeId: varchar("pickaxe_id", { length: 256 }).notNull(),
		itemWrapId: jsonb("item_wrap_id").notNull(),
		contrailId: varchar("contrail_id", { length: 256 }).notNull(),
		loadingScreenId: varchar("loading_screen_id", { length: 256 }).notNull(),
		musicPackId: varchar("music_pack_id", { length: 256 }).notNull(),
	},
	(Exchanges) => {
		return {
			idIndex: uniqueIndex("accountId_idx").on(Exchanges.id),
			lockerNameIndex: uniqueIndex("lockerName_idx").on(Exchanges.lockerName),
		};
	},
);

export type Loadout = typeof Loadouts.$inferSelect;
export type NewLoadout = typeof Loadouts.$inferInsert;

export const Attributes = pgTable('Attributes', {
    profileId: varchar('profile_id', { length: 256 }).notNull(),
    key: varchar('key', { length: 256 }).notNull(),
    valueJSON: jsonb('value_json').notNull(),
    type: varchar('type', { length: 256 }).notNull(),
}, (Exchanges) => {
    return {
        idIndex: index('id_idx').on(Exchanges.profileId),
    }
});

export type Attribute = typeof Attributes.$inferSelect;
export type NewAttribute = typeof Attributes.$inferInsert;