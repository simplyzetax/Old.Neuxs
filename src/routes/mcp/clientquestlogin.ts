import app from "../..";
import { Athena } from "../../database/wrappers/athena.wrapper";
import { getAuthUser } from "../../middleware/auth.middleware";
import { MCPHelper } from "../../aids/mcp/mcp.utility";
import { getVersion } from "../../aids/request/version.utility";

app.post("/fortnite/api/game/v2/profile/*/client/ClientQuestLogin", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.sendError(nexus.authentication.authenticationFailed.variable(["token"]));

    const profileId = c.req.query("profileId") || "common_core";
    if (!["athena", "common_core"].includes(profileId)) return c.sendStatus(204);

    const profile = await MCPHelper.getProfile(user, profileId);
    if (!profile) return c.sendError(nexus.mcp.templateNotFound.withMessage(`Profile ${profileId} not found`));

    const memory = getVersion(c);
    if (profile.rvn == profile.commandRevision) {
        profile.rvn++;
        // @ts-ignore
        if (profileId == "athena" && !profile.stats.attributes.last_applied_loadout)
            // @ts-ignore
            profile.stats.attributes.last_applied_loadout = profile.stats.attributes.loadouts[0];
    }

    // @ts-ignore
    if (profileId == "athena") profile.stats.attributes.season_num = memory.season;

    const profileRevisionCheck = (memory.build >= 12.20) ? profile.commandRevision : profile.rvn;
    const queryRevision = c.req.query("rvn") || -1;
    const applyProfileChanges = (queryRevision != profileRevisionCheck) ? [{ "changeType": "fullProfileUpdate", "profile": profile }] : [];

    return c.json(MCPHelper.createResponse(profile.jsonProfile(), applyProfileChanges));
});