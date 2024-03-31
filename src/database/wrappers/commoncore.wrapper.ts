import path from 'node:path';
import { CommonCoreItemModel, CommonCoreBaseModel, CommonCoreStatsModel } from '../../models/ts/common_core';
import { CommonCorePrepared, buildItems } from '../../aids/mcp/commoncore';
import { db } from '../client';
import { Attributes, Items } from '../../models/db/schema';
import { and, eq } from 'drizzle-orm';

export class CommonCore {
    public accountId: string;
    public profileUniqueId: string;
    public created: string;
    public updated: string;
    public rvn: number;
    public wipeNumber: number;
    public profileId: string;
    public version: string;
    public items: Record<string, CommonCoreItemModel> = {};
    public stats: CommonCoreStatsModel;
    public commandRevision: number;

    constructor(profile: CommonCoreBaseModel) {
        this.accountId = profile.accountId;
        this.profileUniqueId = `${this.accountId}-common_core`;
        this.created = profile.created;
        this.updated = new Date().toISOString();
        this.rvn = profile.rvn;
        this.wipeNumber = profile.wipeNumber;
        this.profileId = profile.profileId;
        this.version = profile.version;
        this.items = profile.items;
        this.stats = profile.stats;
        this.commandRevision = profile.commandRevision;
    }

    public jsonProfile(): CommonCoreBaseModel {
        const { profileUniqueId, ...rest } = this;
        return { ...rest, updated: new Date().toISOString() };
    }

	public async setMtxPurchased(itemId: string, quantity: number) {
		this.items[itemId].quantity = quantity;
		await db
			.update(Items)
			.set({ quantity })
			.where(
				and(eq(Items.profileId, this.profileUniqueId), eq(Items.id, itemId)),
			)
			.execute();
	}

	public async setMtxAffiliate(affiliate: string) {
		this.stats.attributes.mtx_affiliate = affiliate;
		await db
			.update(Attributes)
			.set({ valueJSON: affiliate })
			.where(
				and(
					eq(Attributes.profileId, this.profileUniqueId),
					eq(Attributes.key, "mtx_affiliate"),
				),
			)
			.execute();
	}
}

export namespace CommonCoreHelper {
    export async function getProfile(accountId: string): Promise<CommonCore | undefined> {
        try {
            const [ccProfile] = await CommonCorePrepared.p1.execute({ id: accountId });
            const items = await CommonCorePrepared.p2.execute({ id: ccProfile.id });
            const attributesDb = await CommonCorePrepared.p4.execute({ id: ccProfile.id });

            const attributes = Object.fromEntries(attributesDb.map(attribute => [attribute.key, attribute.valueJSON]));
            const tempItems = buildItems(items);

            const tempProfile: CommonCoreBaseModel = {
                ...ccProfile,
                stats: {
                    attributes: {
                        ...attributes,
                        survey_data: {},
                        personal_offers: {},
                        intro_game_played: true,
                        import_friends_claimed: {},
                        mtx_purchase_history: {
                            refundsUsed: 0,
                            refundCredits: 0,
                            purchases: [],
                        },
                        undo_cooldowns: [],
                        mtx_affiliate_set_time: new Date().toISOString(),
                        inventory_limit_bonus: 0,
                        current_mtx_platform: "EpicPC",
                        mtx_affiliate: "",
                        forced_intro_played: "Coconut",
                        weekly_purchases: [],
                        daily_purchases: [],
                        ban_history: [],
                        in_app_purchases: [],
                        permissions: [],
                        undo_timeout: new Date().toISOString(),
                        monthly_purchases: [],
                        allowed_to_send_gifts: true,
                        mfa_enabled: false,
                        allowed_to_receive_gifts: true,
                        gift_history: [],
                    }
                },
                commandRevision: 0,
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                rvn: ccProfile.revision,
                wipeNumber: 0,
                profileId: ccProfile.type, // Just fancy "common_core"
                version: "11.31",
                items: tempItems,
            }

            return new CommonCore(tempProfile);
        } catch (error: unknown) {
            return undefined;
        }
    }
}
