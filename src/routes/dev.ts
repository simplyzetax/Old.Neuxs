import app from "..";
import path from "path";
import { AthenaSchemaModelDB } from "../models/ts/athena";
import { Items, NewItem } from "../models/db/schema";
import { StringsHelper } from "../aids/string/strings.aid";
import { db } from "../database/client";
import { CommonCoreHelper } from "../database/wrappers/commoncore.wrapper";
import { createProfiles, deleteProfiles } from "../aids/profiles/creator";
import { AthenaHelper } from "../database/wrappers/athena.wrapper";

app.get("/athena", async (c) => {

    const athena = await Bun.file(path.join(import.meta.dir, '../../resources/profiletemplates/athena.json')).json() as AthenaSchemaModelDB;
    const items = athena.items;

    const keys = Object.keys(items);
    const newItems: NewItem[] = [];

    for (const key of keys) {

        if(key.includes("loadout")) continue;

        const item = items[key];

        const tempItem: NewItem = {
            id: StringsHelper.uuidRp(),
            templateId: item.templateId,
            quantity: 1,
            favorite: false,
            profileId: "eddea28aa47e435f8a41fc78ac2dd85e-athena",
            seen: true,
        }

        newItems.push(tempItem);
    }

    await db.insert(Items).values(newItems);

    return c.json(items);
});

app.get("/cc", async (c) => {

    const cc = await CommonCoreHelper.getProfile("eddea28aa47e435f8a41fc78ac2dd85e")
    if(!cc) return c.json({ error: "profile not found" });
    return c.json(cc.jsonProfile());

});

app.get("/delete", async (c) => {
    await createProfiles("eddea28aa47e435f8a41fc78ac2dd85e")
    return c.json({ success: true });
});

app.get("/getathena", async (c) => {
    const athena = await AthenaHelper.getProfile("eddea28aa47e435f8a41fc78ac2dd85e")
    if(!athena) return c.json({ error: "profile not found" });
    return c.json(athena.jsonProfile());
});