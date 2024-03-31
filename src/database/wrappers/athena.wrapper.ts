import { AthenaItemModel, AthenaSchemaModelDB, AthenaSchemaModelJSON, AthenaStatsSchemaModel, LoadoutSchemaModel } from '../../models/ts/athena';
import { db } from '../client';
import { AthenaPrepared, buildItems, buildLoadouts } from '../../aids/mcp/athena';
import { Attributes, Item, Items, Loadout, Loadouts, NewLoadout, Profile, Profiles } from '../../models/db/schema';
import { and, eq } from 'drizzle-orm';
import Logger from '../../aids/logging/logging.utility';

type TableKey = 'attributes' | 'items' | 'loadouts' | 'profile';

type Change = {
    table: TableKey;
    action: string;
    key: string;
    value: any;
};

type TAction = "INSERT" | "UPDATE" | "DELETE";

interface IChange {
    table: string;
    key: string;
    value: any;
    action: TAction;
}

const athenaCache: Map<string, Athena> = new Map();

export class Athena {

    public accountId: string;
    public profileUniqueId: string;
    public created: string;
    public updated: string;
    public rvn: number;
    public wipeNumber: number;
    public profileId: string;
    public version: string;
    public items: Record<string, AthenaItemModel> = {};
    public loadouts: Record<string, LoadoutSchemaModel> = {};
    public stats: AthenaStatsSchemaModel;
    public commandRevision: number;

    private changes: IChange[] = [];

    constructor(profile: AthenaSchemaModelDB) {
        this.accountId = profile.accountId;
        this.created = profile.created;
        this.profileUniqueId = `${profile.accountId}-athena`;
        this.updated = new Date().toISOString();
        this.rvn = profile.rvn;
        this.wipeNumber = profile.wipeNumber;
        this.profileId = profile.profileId;
        this.version = profile.version;
        this.items = profile.items;
        this.stats = profile.stats;
        this.commandRevision = profile.commandRevision;
    }

    public jsonProfile(): AthenaSchemaModelJSON {
        let tmpProfile = {
            accountId: this.accountId,
            created: this.created,
            profileId: this.profileId,
            rvn: this.rvn,
            wipeNumber: this.wipeNumber,
            version: this.version,
            items: {
                ...this.items,
                ...this.loadouts
            },
            stats: this.stats,
            commandRevision: this.commandRevision,
            updated: new Date().toISOString()
        }
        return tmpProfile;
    }

    public setAttribute(key: string, value: any): void {
        this.changes.push({
            table: "attributes",
            action: "UPDATE",
            key,
            value
        });
        this.stats.attributes[key] = value;
    }

    public equipFavorite(slot: string, itemId: string, index = 0): void {
        const allowedSlots = [
            "favorite_character",
            "favorite_backpack",
            "favorite_pickaxe",
            "favorite_glider",
            "favorite_skydivecontrail",
            "favorite_dance",
            "favorite_musicpack",
            "favorite_loadingscreen",
            "favorite_itemwrap"
        ];

        if (!allowedSlots.includes(slot)) {
            throw new Error(`Invalid slot ${slot}`);
        }

        if (slot === "favorite_itemwrap") slot = "favorite_itemwraps";

        const isDanceOrWrap = slot === "favorite_dance" || slot === "favorite_itemwraps";

        const value = isDanceOrWrap 
            ? this.stats.attributes[slot].map((item: any, i: any) => i === index ? itemId : item)
            : itemId;

        this.stats.attributes = { ...this.stats.attributes, [slot]: value };

        this.changes.push({
            table: "attributes",
            action: "UPDATE",
            key: slot,
            value
        });
    }

    public hasItem(itemId: string): boolean {
        return Object.keys(this.items).includes(itemId);
    }

    public getAttribute(key: string): any {
        return this.stats.attributes[key];
    }

    public bumpRvn(): void {

        this.changes.push({
            table: "profile",
            action: "UPDATE",
            key: "revision",
            value: this.rvn + 1
        });

        this.rvn++;
    }

    public setItem(item: AthenaItemModel): void {

        this.changes.push({
            table: "items",
            action: "UPDATE",
            key: item.templateId,
            value: item
        });

        this.items[item.templateId] = item;
    }

    private tableMethods: Record<TableKey, any> = {
        attributes: { update: this.updateAttribute },
        items: { update: this.updateItem, insert: this.insertItem, delete: this.deleteItem },
        loadouts: { update: this.updateLoadout, insert: this.insertLoadout, delete: this.deleteLoadout },
        profile: { update: this.updateProfile }
    };

    public async save(): Promise<void> {
        athenaCache.set(this.profileUniqueId, this);
        for (const change of this.changes as Change[]) {
            const method = this.tableMethods[change.table][change.action.toLowerCase()];
            if (method) {
                await method.call(this, change.key, change.value);
            }
        }
    }

    public getItem(itemId: string): AthenaItemModel | undefined {
        return this.items[itemId];
    }

    public update(table: TableKey, key: string, value: any): void {
        const method = this.tableMethods[table]?.update;
        if (method) {
            method.call(this, key, value);
        }
    }

    public async updateAttribute(key: string, value: any): Promise<void> {
        this.stats.attributes[key] = value;
        await db.update(Attributes).set({ valueJSON: value }).where(and(eq(Attributes.profileId, this.profileUniqueId), eq(Attributes.key, key)));
    }

    public async updateItem(itemId: string, value: Item): Promise<void> {
        await db.update(Items).set(value).where(and(eq(Items.profileId, this.profileUniqueId), eq(Items.id, itemId)));
    }

    public async updateLoadout(loadoutId: string, value: LoadoutSchemaModel): Promise<void> {
        await db.update(Loadouts).set(value).where(and(eq(Loadouts.profileId, this.profileUniqueId), eq(Loadouts.id, loadoutId)));
    }

    public async updateProfile(key: keyof Profile, value: any): Promise<void> {
        await db.update(Profiles).set({ [key]: value }).where(eq(Profiles.id, this.profileUniqueId));
    }

    public insert(table: TableKey, key: string, value: any): void {
        const method = this.tableMethods[table]?.insert;
        if (method) {
            method.call(this, value);
        }
    }

    public async insertItem(value: Item): Promise<void> {
        await db.insert(Items).values(value);
    }

    public async insertLoadout(value: Loadout): Promise<void> {
        db.insert(Loadouts).values(value);
    }

    public delete(table: TableKey, key: string): void {
        const method = this.tableMethods[table]?.delete;
        if (method) {
            method.call(this, key);
        }
    }

    public async deleteItem(itemId: string): Promise<void> {
        await db.delete(Items).where(and(eq(Items.profileId, this.profileUniqueId), eq(Items.id, itemId)));
    }

    public async deleteLoadout(loadoutId: string): Promise<void> {
        await db.delete(Loadouts).where(and(eq(Loadouts.profileId, this.profileUniqueId), eq(Loadouts.id, loadoutId)));
    }
}

export namespace AthenaHelper {
    export async function getProfile(accountId: string): Promise<Athena | undefined> {
        try {

            if (athenaCache.has(accountId)) {
                Logger.success(`[Athena] Cache hit for ${accountId}`);
                return athenaCache.get(accountId);
            }

            // Fetch data from database
            const [athenaProfile] = await AthenaPrepared.p1.execute({ id: accountId });
            const items = await AthenaPrepared.p2.execute({ id: athenaProfile.id });
            const lockers = await AthenaPrepared.p3.execute({ id: athenaProfile.id });
            const attributesDb = await AthenaPrepared.p4.execute({ id: athenaProfile.id });

            const attributes = {} as Record<string, any>;
            for (const attribute of attributesDb) {
                attributes[attribute.key] = attribute.valueJSON;
            }
            // Build items and loadouts
            const tempItems = buildItems(items);
            const tempLoadouts = buildLoadouts(lockers);

            // Build profile
            const tempProfile: AthenaSchemaModelDB = {
                accountId: athenaProfile.accountId,
                profileUniqueId: athenaProfile.id,
                stats: {
                    attributes: {
                        season_match_boost: attributes['season_match_boost'],
                        loadouts: attributes['loadouts'],
                        rested_xp_overflow: attributes['rested_xp_overflow'],
                        mfa_reward_claimed: attributes['mfa_reward_claimed'],
                        quest_manager: {},
                        mfa_enabled: attributes['mfa_enabled'],
                        book_level: attributes['book_level'],
                        season_num: attributes['season_num'],
                        season_update: attributes['season_update'],
                        book_xp: attributes['book_xp'],
                        permissions: attributes['permissions'],
                        book_purchased: attributes['book_purchased'],
                        lifetime_wins: attributes['lifetime_wins'],
                        party_assist_quest: attributes['party_assist_quest'],
                        purchased_battle_pass_tier_offers: attributes['purchased_battle_pass_tier_offers'],
                        rested_xp_exchange: attributes['rested_xp_exchange'],
                        level: attributes['level'],
                        xp_overflow: attributes['xp_overflow'],
                        rested_xp: attributes['rested_xp'],
                        rested_xp_mult: attributes['rested_xp_mult'],
                        accountLevel: attributes['accountLevel'],
                        competitive_identity: attributes['competitive_identity'],
                        inventory_limit_bonus: attributes['inventory_limit_bonus'],
                        last_applied_loadout: attributes['last_applied_loadout'],
                        daily_rewards: attributes['daily_rewards'],
                        xp: attributes['xp'],
                        season_friend_match_boost: attributes['season_friend_match_boost'],
                        active_loadout_index: attributes['active_loadout_index'],
                        favorite_musicpack: attributes['favorite_musicpack'],
                        favorite_glider: attributes['favorite_glider'],
                        favorite_pickaxe: attributes['favorite_pickaxe'],
                        favorite_skydivecontrail: attributes['favorite_skydivecontrail'],
                        favorite_backpack: attributes['favorite_backpack'],
                        favorite_dance: attributes['favorite_dance'],
                        favorite_itemwraps: attributes['favorite_itemwraps'],
                        favorite_character: attributes['favorite_character'],
                        favorite_loading_screen: attributes['favorite_loading_screen'],
                    },
                },
                commandRevision: 0,
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                rvn: athenaProfile.revision,
                wipeNumber: 0,
                profileId: athenaProfile.type, // Just fancy "athena"
                version: "11.31",
                items: {
                    ...tempItems,
                    ...tempLoadouts,
                },
            }

            const newAthena = new Athena(tempProfile);
            athenaCache.set(accountId, newAthena);

            return newAthena;
        } catch (error: unknown) {
            return undefined;
        }
    }
}
