export interface CommonCoreBaseModel {
	created: string;
	updated: string;
	rvn: number;
	wipeNumber: number;
	accountId: string;
	profileId: string;
	version: string;
	items: Record<string, CommonCoreItemModel>;
	stats: CommonCoreStatsModel;
	commandRevision: number;
}

export interface CommonCoreItemModel {
	templateId: string;
	attributes: {
		favorite?: boolean;
		level?: number;
		max_level_bonus?: number;
		item_seen?: boolean;
		platform?: string;
	};
	quantity: number;
}

export interface CommonCoreStatsModel {
	attributes: {
		survey_data: object;
		personal_offers: object;
		intro_game_played: boolean;
		import_friends_claimed: object;
		mtx_purchase_history: {
			refundsUsed: number;
			refundCredits: number;
			purchases: object[];
		};
		undo_cooldowns: object[];
		mtx_affiliate_set_time: string;
		inventory_limit_bonus: number;
		current_mtx_platform: string;
		mtx_affiliate: string;
		forced_intro_played: string; // "Coconut"?
		weekly_purchases: object[];
		daily_purchases: object[];
		ban_history: object[];
		in_app_purchases: object[];
		permissions: object[];
		undo_timeout: string;
		monthly_purchases: object[];
		allowed_to_send_gifts: boolean;
		mfa_enabled: boolean;
		allowed_to_receive_gifts: boolean;
		gift_history: object[];
	};
}
