import app from "../..";
import { CommonCore } from "../../database/wrappers/commoncore.wrapper";
import { UserWrapper } from "../../database/wrappers/user.wrapper";
import { getAuthUser } from "../../middleware/auth.middleware";
import { MCPHelper } from "../../aids/mcp/mcp.utility";

app.post("/fortnite/api/game/v2/profile/*/client/SetAffiliateName", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.sendError(nexus.authentication.authenticationFailed.variable(["token"]));

    let body;
    try { body = await c.req.json(); }
    catch (err) { console.log(err); return c.sendError(nexus.mcp.invalidPayload.withMessage("Invalid payload")); }

	const { affiliateName } = body;

    const affiliateCheck = await UserWrapper.findUserByUsername(affiliateName);
		if (!affiliateCheck || affiliateCheck.username === user.username)
			return c.sendError(
				nexus.mcp.invalidPayload.withMessage("Invalid payload"),
			);

		const profile = (await MCPHelper.getProfile(user, "common_core")) as
			| CommonCore
			| undefined;
		if (!profile)
			return c.sendError(
				nexus.mcp.templateNotFound.withMessage(`Profile common core not found`),
			);

		Object.assign(profile, {
			rvn: profile.rvn + 1,
			commandRevision: profile.commandRevision + 1,
			updated: new Date().toISOString(),
			stats: { attributes: { mtx_affiliate: affiliateName } },
		});
		para(f(profile.setMtxAffiliate(affiliateName)));

		return c.json(MCPHelper.createResponse(profile, []));
	},
);
