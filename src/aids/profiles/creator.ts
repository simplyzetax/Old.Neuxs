import { join } from "path";
import { and, eq } from "drizzle-orm";
import { db } from "../../database/client";
import {
	Attributes,
	Items,
	Loadouts,
	NewLoadout,
	NewProfile,
	Profiles,
} from "../../models/db/schema";
import { AthenaSchemaModelDB } from "../../models/ts/athena";
import { StringsHelper } from "../string/strings.aid";

export async function createProfiles(accountId: string) {
	console.error("Creating profiles...");

	const newAthena: NewProfile = {
		id: accountId + "-athena",
		accountId: accountId,
		type: "athena",
		revision: 1,
	};

	await db.insert(Profiles).values(newAthena);

	// Insert CommonCore profile

	const newCommonCore: NewProfile = {
		id: accountId + "-common_core",
		accountId: accountId,
		type: "common_core",
		revision: 1,
	};

	await db.insert(Profiles).values(newCommonCore);

	console.error("Creating items...");

	const athena = (await Bun.file(
		join(import.meta.dir, "../../../resources/profiletemplates/athena.json"),
	).json()) as AthenaSchemaModelDB;
	const newItems = Object.keys(athena.items)
		.filter((key) => !key.includes("loadout"))
		.map((key) => ({
			id: StringsHelper.uuidRp(),
			templateId: athena.items[key].templateId,
			quantity: 1,
			favorite: false,
			profileId: `${accountId}-athena`,
			seen: true,
		}));

	newItems.push({
		id: StringsHelper.uuidRp(),
		templateId: "Currency:MtxPurchased",
		quantity: 0,
		favorite: false,
		profileId: `${accountId}-common_core`,
		seen: true,
	});

	console.error("Inserting items...");

	await db.insert(Items).values(newItems);

	console.error("Creating attributes...");

	const newAttributes = Object.keys(athena.stats.attributes).map((key) => ({
		type: typeof athena.stats.attributes[key],
		profileId: `${accountId}-athena`,
		key,
		valueJSON: athena.stats.attributes[key],
	}));

	console.error("Inserting attributes...");

	await db.insert(Attributes).values(newAttributes);

	await db.insert(Attributes).values({
		type: "string",
		profileId: `${accountId}-common_core`,
		key: "mtx_affiliate",
		valueJSON: "",
	});

	console.error("Creating loadouts...");

	const tempLoadouts: NewLoadout[] = [
		{
			id: StringsHelper.uuidRp(),
			profileId: `${accountId}-athena`,
			templateId: "DefaultLocker-1",
			lockerName: "Locker 1",
			bannerId: "",
			bannerColorId: "",
			characterId: "AthenaCharacter:CID_001_Athena_Commando_F_Default",
			backpackId: "",
			gliderId: "",
			danceId: "",
			pickaxeId: "",
			itemWrapId: "",
			contrailId: "",
			loadingScreenId: "",
			musicPackId: "",
		},
	];

	console.error("Inserting loadouts...");

	await db.insert(Loadouts).values(tempLoadouts);
}

export async function deleteProfiles(accountId: string) {
	await db
		.delete(Profiles)
		.where(and(eq(Profiles.accountId, accountId)))
		.execute();
	await db.delete(Items).where(and(eq(Items.profileId, `${accountId}-athena`)));
	await db
		.delete(Attributes)
		.where(and(eq(Attributes.profileId, `${accountId}-athena`)));
	await db
		.delete(Loadouts)
		.where(and(eq(Loadouts.profileId, `${accountId}-athena`)));
	await db
		.delete(Items)
		.where(and(eq(Items.profileId, `${accountId}-common_core`)));
}
