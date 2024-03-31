import app from "../..";
import { getAuthUser } from "../../middleware/auth.middleware";
import { MCPHelper } from "../../aids/mcp/mcp.utility";
import { getVersion } from "../../aids/request/version.utility";

app.post("/fortnite/api/game/v2/profile/*/client/SetMtxPlatform", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.sendError(nexus.authentication.authenticationFailed.variable(["token"]));

    const profileId = c.req.query("profileId") || "common_core";
    const profile = await MCPHelper.getProfile(user, profileId);
    if (!profile) return c.sendError(nexus.mcp.templateNotFound.withMessage(`Profile ${profileId} not found`));

    const memory = getVersion(c);
    if (profile.rvn == profile.commandRevision) {
        profile.rvn++;
    }

    const profileRevisionCheck = (memory.build >= 12.20) ? profile.commandRevision : profile.rvn;
    const queryRevision = c.req.query("rvn") || -1;
    const applyProfileChanges = (queryRevision != profileRevisionCheck) ? [{ "changeType": "fullProfileUpdate", "profile": profile }] : [];

    return c.json(MCPHelper.createResponse(profile.jsonProfile(), applyProfileChanges));
});