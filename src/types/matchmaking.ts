export interface MMPlayer {
	accountId: string;
	customKey: string;
	region: string;
	playlist: string;
	ip: string;
	port: number;
}

export type Platform = "Windows" | "Mac";

export interface MatchmakingPayload {
	playerId: string;
	partyPlayerIds: string[];
	bucketId: string;
	attributes: {
		"player.subregions": string;
		"player.season": number;
		"player.option.partyId": string;
		"player.userAgent": string;
		"player.platform": Platform;
		"player.option.linkType": string;
		"player.preferredSubregion": string; //DE, GB, FR, etc
		"player.input": string; //KBM etc
		"playlist.revision": number;
		"player.option.customKey"?: string;
		"player.option.fillTeam": boolean;
		"player.option.linkCode": string;
		"player.option.uiLanguage": string;
		"player.privateMMS": boolean;
		"player.option.spectator": boolean;
		"player.inputTypes": string;
		"player.option.groupBy": string; //Mnemonic, same as linkCode
		"player.option.microphoneEnabled": boolean;
	};
	expireAt: string;
	nonce: string;
}