import { and, eq } from "drizzle-orm";
import app from "../..";
import { MCPHelper } from "../../aids/mcp/mcp.utility";
import { db } from "../../database/client";
import { AthenaHelper } from "../../database/wrappers/athena.wrapper";
import { getAuthUser } from "../../middleware/auth.middleware";
import { Attributes } from "../../models/db/schema";

app.post("/fortnite/api/game/v2/profile/*/client/EquipBattleRoyaleCustomization", async (c) => {

    const user = await getAuthUser(c);
    const profileId = c.req.query("profileId");
    const qRvn = c.req.query("rvn");

    let body: any;
    try {
        body = await c.req.json();
    } catch (err) {
        return c.sendError(nexus.mcp.invalidPayload.withMessage("Invalid body"));
    }

    const { itemToSlot, slotName, indexWithinSlot } = body as { itemToSlot: string, slotName: string, indexWithinSlot: number };
    const favoriteName = `favorite_${slotName.toLowerCase()}`;

    if (!user) return c.sendError(nexus.authentication.authenticationFailed.variable(["token"]));
    if (!profileId || profileId !== "athena") return c.sendError(nexus.mcp.invalidPayload.withMessage("Missing query profileId"));
    if (!qRvn) return c.sendError(nexus.mcp.invalidPayload.withMessage("Missing query rvn"));

    const profile = await AthenaHelper.getProfile(user.accountId);
    if (!profile) return c.sendError(nexus.mcp.templateNotFound.withMessage(`Profile ${profileId} not found`));

    if(!profile.hasItem(itemToSlot)) return c.sendError(nexus.mcp.templateNotFound.withMessage(`You do not own ${itemToSlot}`));

    profile.equipFavorite(favoriteName, itemToSlot, indexWithinSlot);
    Promise.all([profile.bumpRvn(), profile.save()]);

    let applyProfileChanges: object[] = [];
    let value: any = itemToSlot;
    if (favoriteName === "favorite_dance" || favoriteName === "favorite_itemwrap") {
        const dbFavoriteName = favoriteName === "favorite_itemwrap" ? "favorite_itemwraps" : favoriteName;
        const [attribute] = await db.select().from(Attributes).where(and(eq(Attributes.profileId, profile.profileUniqueId), eq(Attributes.key, dbFavoriteName)));
        value = attribute.valueJSON;
    }

    applyProfileChanges.push({
        changeType: "statModified",
        name: favoriteName,
        value
    });

    return c.json(MCPHelper.createResponse(profile, applyProfileChanges));

});