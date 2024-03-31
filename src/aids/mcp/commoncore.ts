import { and, eq, sql } from "drizzle-orm";
import { db } from "../../database/client";
import { CommonCoreItemModel } from "../../models/ts/common_core";

import { Attributes, Item, Items, Profiles } from "../../models/db/schema";

export function buildItems(items: Item[]) {
	const tempItems: Record<string, CommonCoreItemModel> = {};
	for (const item of items) {
		tempItems[item.templateId] = {
			templateId: item.templateId,
			attributes: {
				platform: "EpicPC",
			},
			quantity: item.quantity,
		};
	}
	return tempItems;
}
export namespace CommonCorePrepared {
	export const p1 = db
		.select()
		.from(Profiles)
		.where(
			and(
				eq(Profiles.accountId, sql.placeholder("id")),
				eq(Profiles.type, "common_core"),
			),
		)
		.prepare("profilesprep2");
	export const p2 = db
		.select()
		.from(Items)
		.where(eq(Items.profileId, sql.placeholder("id")))
		.prepare("itemsprep2");
	export const p4 = db
		.select()
		.from(Attributes)
		.where(eq(Attributes.profileId, sql.placeholder("id")))
		.prepare("attributesprep2");
}
