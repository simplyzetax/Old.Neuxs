import app from "../..";
import { getAuthUser } from "../../middleware/auth.middleware";
import { AthenaItemModel } from "../../models/ts/athena";
import { MCPHelper } from "../../aids/mcp/mcp.utility";
import { getVersion } from "../../aids/request/version.utility";
import { AthenaHelper } from "../../database/wrappers/athena.wrapper";
import { db } from "../../database/client";
import { Items } from "../../models/db/schema";
import { and, eq } from "drizzle-orm";

app.post("/fortnite/api/game/v2/profile/*/client/MarkItemSeen", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.sendError(nexus.authentication.authenticationFailed.variable(["token"]));

    let body: any;
    try {
        body = await c.req.json();
    } catch (err) {
        return c.sendError(nexus.mcp.invalidPayload.withMessage("Invalid body"));
    }

    const profile = await AthenaHelper.getProfile(user.accountId);
    if (!profile) return c.sendError(nexus.mcp.templateNotFound.withMessage(`Profile athena not found`));

    const applyProfileChanges = body.itemIds.map((itemId: string) => ({
        "changeType": "itemAttrChanged",
        "itemId": itemId,
        "attributeName": "item_seen",
        "attributeValue": true
    }));

    const updatePromises = body.itemIds.map(async (itemId: string) => {
        const item = profile.items[itemId];
        if (!item) return;

        const [dbItem] = await db.select().from(Items).where(and(eq(Items.profileId, profile.profileUniqueId), eq(Items.id, itemId)))
        if (!dbItem) return;

        await db.update(Items).set({ seen: true }).where(and(eq(Items.profileId, profile.profileUniqueId), eq(Items.id, itemId))).execute();
    });

    await Promise.all([...updatePromises, profile.bumpRvn(), profile.save()]);

    return c.json(MCPHelper.createResponse(profile.jsonProfile(), applyProfileChanges));
});