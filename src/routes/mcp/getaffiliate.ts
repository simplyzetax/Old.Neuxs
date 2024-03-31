import app from "../..";
import { UserWrapper } from "../../database/wrappers/user.wrapper";

app.get("/affiliate/api/public/affiliates/slug/:slug", async (c) => {
    const slug = c.req.param("slug").toLowerCase();

    const affiliateUser = await UserWrapper.findUserByUsernameLower(slug);
    if (!affiliateUser) return c.sendError(nexus.mcp.templateNotFound.withMessage(`Affiliate ${slug} not found`));

    return c.json({
        id: affiliateUser.accountId,
        slug: slug,
        displayName: affiliateUser.username,
        status: "ACTIVE",
        verified: true,
    });
});