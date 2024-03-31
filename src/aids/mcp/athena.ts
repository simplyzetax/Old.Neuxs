import { and, eq, sql } from "drizzle-orm";
import { db } from "../../database/client";
import { Attributes, Items, Loadouts, NewItem, Profiles } from "../../models/db/schema";
import { ILocker } from "../../types/loadout";

export function buildItems(items: any[]) {
    const tempItems: any = {};
    for (const item of items) {
        tempItems[item.id] = {
            templateId: item.templateId,
            attributes: {
                level: 1,
                item_seen: !!item.seen,
                xp: 0,
                variants: [],
                favorite: !!item.favorite,
                max_level_bonus: 0,
                rnd_sel_cnt: 0,
                locker_slots_data: {},
            },
        };
    }
    return tempItems;
}

// Helper function to build loadouts
export function buildLoadouts(lockers: ILocker[]) {
    const tempLoadouts: any = {};
    for (const locker of lockers) {
        tempLoadouts[locker.id] = {
            templateId: locker.templateId,
            quantity: 1,
            attributes: {
                locker_slots_data: {
                    slots: ['Pickaxe', 'Dance', 'Glider', 'Character', 'Backpack', 'ItemWrap', 'LoadingScreen', 'SkyDiveContrail', 'MusicPack'].reduce((acc, key) => ({
                        ...acc,
                        [key]: {
                            items: [`${locker[`${key.toLowerCase()}Id`]}`],
                            activeVariants: key === 'Character' ? [{ variants: [] }] : [],
                        }
                    }), {}),
                },
                use_count: 0,
                banner_icon_template: locker.bannerId,
                locker_name: locker.lockerName,
                banner_color_template: locker.bannerColorId,
                items_seen: true,
                favorite: false,
            },
        };
    }
    return tempLoadouts;
}

export namespace AthenaPrepared {
    export const p1 = db.select().from(Profiles).where(and(eq(Profiles.accountId, sql.placeholder('id')), eq(Profiles.type, 'athena'))).prepare("profilesprep");
    export const p2 = db.select().from(Items).where(eq(Items.profileId, sql.placeholder('id'))).prepare("itemsprep");
    export const p3 = db.select().from(Loadouts).where(eq(Loadouts.profileId, sql.placeholder('id'))).prepare("loadoutsprep");
    export const p4 = db.select().from(Attributes).where(eq(Attributes.profileId, sql.placeholder('id'))).prepare("attributesprep");
}