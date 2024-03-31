import { eq, sql } from "drizzle-orm";
import app from "..";
import { UserWrapper } from "../database/wrappers/user.wrapper";
import { nexus } from "../aids/error/error.utility";
import { NewUser, User, users } from "../models/db/user";
import { StringsHelper } from "../aids/string/strings.aid";
import { CryptoHelper } from "../aids/crypto/crypto.utility";
import { db } from "../database/client";

app.get("/account/api/public/account/*/externalAuths", (c) => {
	return c.json([]);
});

app.get("/account/api/public/account", async (c) => {
	const response: object[] = [];

	if (typeof c.req.query("accountId") === "string") {
		const user = await UserWrapper.findUserById(c.req.query("accountId") as string);
        console.log(user)

		if (user) {
			response.push({
				id: user.accountId,
				displayName: user.username,
				externalAuths: {},
			});
		}
	}

    if (Array.isArray(c.req.query("accountId"))) {
        const accountIds = c.req.queries("accountId");
        if(!accountIds) return c.sendStatus(400);
        const accountIdsString = accountIds.map((id: string) => `'${id}'`).join(",");
        const users = await db.execute(sql`
            SELECT *
            FROM users
            WHERE accountId IN (${accountIdsString})
            AND banned = false;
        `);

		if (users) {
			for (const user of (users as unknown) as User[]) {
				if (response.length >= 100) break;

				response.push({
					id: user.accountId,
					displayName: user.username,
					externalAuths: {},
				});
			}
		}
	}

	return c.json(response);
});

app.get("/account/api/public/account/displayName/:displayName", async (c) => {

    const displayName = c.req.param("displayName");
    if(!displayName) return c.sendStatus(400);

    const user = await UserWrapper.findUserByUsername(displayName);
	if (!user) return c.sendError(nexus.account.accountNotFound);

	return c.json({
		id: user.accountId,
		displayName: user.username,
		externalAuths: {},
	});
});

app.get("/account/api/public/account/email/:email", async (c) => {

    const email = c.req.param("email");
    if(!email) return c.sendStatus(400);

    const user = await UserWrapper.findUserByEmail(email);
	if (!user) return c.sendError(nexus.account.accountNotFound);

	return c.json({
		id: user.accountId,
		displayName: user.username,
		externalAuths: {},
	});
});

app.post("/datarouter/api/v1/public/data", (c) => {
	return c.sendStatus(204);
});

app.get("/account/api/public/account/:accountId", async (c) => {

	const accountId = c.req.param("accountId");

    const user = await UserWrapper.findUserById(c.req.param("accountId"));
    if(!user) return c.sendError(nexus.account.accountNotFound.variable([accountId]));

	return c.json({
        id: user.accountId,
		displayName: user.username,
		name: "Nexus",
		email: `[hidden]@${user.email.split("@")[1]}`,
		failedLoginAttempts: 0,
		lastLogin: new Date().toISOString(),
		numberOfDisplayNameChanges: 0,
		ageGroup: "UNKNOWN",
		headless: false,
		country: "US",
		lastName: "Client",
		preferredLanguage: "en",
		canUpdateDisplayName: false,
		tfaEnabled: false,
		emailVerified: true,
		minorVerified: false,
		minorStatus: "NOT_MINOR",
		cabinedMode: false,
		hasHashedEmail: false,
	});
});