import url from "url";
import jwt, { JwtPayload } from "jsonwebtoken";

import { eq } from "drizzle-orm";
import app from "..";
import { nexus } from "../aids/error/error.utility";
import { JwtHelper } from "../aids/jwt/jwt.utility";
import Logger from "../aids/logging/logging.utility";
import { OAuthUtility } from "../aids/oauth/clients.utility";
import { StringsHelper } from "../aids/string/strings.aid";
import { db } from "../database/client";
import { UserWrapper } from "../database/wrappers/user.wrapper";
import { authMiddleware, getAuthUser } from "../middleware/auth.middleware";
import { tokens } from "../models/db/token";
import { TOAuthBody } from "../types/oauth";
import { accessToken, refreshToken } from "../types/tokens";

//export const appt = app.use("*", authMiddleware());

app.post("/account/api/oauth/token", async (c) => {
	const authHeader = c.req.header("Authorization");
	if (!authHeader) return c.sendError(nexus.authentication.invalidHeader);

	const [clientId] = StringsHelper.decodeBase64(authHeader.split(" ")[1]).split(":");
	const [_, clientSecret] = StringsHelper.decodeBase64(authHeader.split(" ")[1]).split(":");
	if (!clientId || !clientSecret) return c.sendError(nexus.authentication.oauth.invalidClient);

	if (!OAuthUtility.isValidClient(clientId, clientSecret)) {
		return c.sendError(nexus.authentication.oauth.invalidClient);
	}

	let requestBody: TOAuthBody;
	try {
		requestBody = await c.req.parseBody() as unknown as TOAuthBody;
	} catch {
		return c.sendError(nexus.basic.badRequest.withMessage("Failed to parse request body"));
	}

	let user;

	const clientIp = c.req.header("x-forwarded-for") ?? "127.0.0.1";

	switch (requestBody.grant_type) {
		case "client_credentials": {
			const token = await JwtHelper.createClientToken(
				clientId,
				requestBody.grant_type,
				clientIp,
				4,
			);
			const decodedClient = JwtHelper.isJwtPayload(jwt.decode(token) as JwtPayload);
			if (typeof decodedClient !== "object") return c.sendError(nexus.authentication.validationFailed);

			const expiresIn = Math.round((StringsHelper.dateAddTime(new Date(decodedClient.creationDate),decodedClient.hoursExpire).getTime() - new Date().getTime()) / 1000);
			const expiresAt = StringsHelper.dateAddTime(new Date(decodedClient.creationDate), decodedClient.hoursExpire).toISOString();

			return c.json({
				access_token: `eg1~${token}`,
				expires_in: expiresIn,
				expires_at: expiresAt,
				token_type: "bearer",
				client_id: clientId,
				internal_client: true,
				client_service: "fortnite",
			});
		}
		case "password": {
			const { username: email, password } = requestBody;
			if (!email || !password)
				return c.sendError(
					nexus.basic.badRequest.withMessage("Missing username or password"),
				);

			user = await UserWrapper.findUserByEmail(email.toString());

			if (!user || !(await Bun.password.verify(password.toString(), user.password))) {
				return c.sendError(user ? nexus.authentication.oauth.invalidAccountCredentials : nexus.account.accountNotFound.variable([email.toString()]));
			}

			break;
		}

		//In theory this could allow bad actors to get access to accounts by just having a discord accounts access token
		//which is really easy to do as everyone who has discord oauth implemented has an access token of the user who
		//agreed to the oauth

		case "external_auth": {
			const { external_auth_type: externalAuthType, external_auth_token: externalAuthToken } = requestBody;
			if (!externalAuthType || !externalAuthToken) return c.sendError(nexus.basic.badRequest);

			if (externalAuthType !== "discord") return c.sendError(nexus.authentication.oauth.invalidExternalAuthType.variable([externalAuthType]));

			const userInfo = await fetch("https://discord.com/api/users/@me", {
				headers: {
					Authorization: `Bearer ${externalAuthToken}`,
				},
			});

			if (!userInfo.ok) return c.sendError(nexus.basic.badRequest);

			const userJson: any = await userInfo.json();

			user = await UserWrapper.findUserByDiscordId(userJson.id);

			break;
		}

		case "refreshtoken": {
			const { refresh_token: refreshToken } = requestBody;
			if (!refreshToken) return c.sendError(nexus.basic.badRequest);

			const refreshTokenIndex = refreshTokens.findIndex(
				(token) => token.token === refreshToken,
			);

			if (refreshTokenIndex === -1 || JwtHelper.isTokenExpired(refreshTokens[refreshTokenIndex].token.replace("eg1~", ""))) {
				return c.sendError(nexus.authentication.oauth.invalidRefresh.with("Invalid refresh token"));
			}

			user = await UserWrapper.findUserById(refreshTokens[refreshTokenIndex].accountId);
			break;
		}
		case "exchange_code": {
			const { exchange_code: exchangeCodeBody } = requestBody;
			if (!exchangeCodeBody) return c.sendError(nexus.basic.badRequest);

			const exchangeCodeObj = exchangeCodes.find(
				(exchangeCode) => exchangeCode.exchangeCode === exchangeCodeBody,
			);

			if (!exchangeCodeObj) {
				return c.sendError(
					nexus.authentication.oauth.invalidExchange.variable([
						exchangeCodeBody,
					]),
				);
			}

			if (exchangeCodeBody !== "Nexus-Zetax") {
				exchangeCodes = global.exchangeCodes.filter(
					(code) => code !== exchangeCodeObj,
				);
			}

			user = await UserWrapper.findUserById(exchangeCodeObj.accountId);
			break;
		}
		default: {
			return c.sendError(
				nexus.authentication.oauth.grantNotImplemented.variable([requestBody.grant_type]),
			);
		}
	}

	if (!user) return c.sendError(nexus.account.accountNotFound.with(`Account object was not set`));

	const removeFromArray = (array: accessToken[] | refreshToken[], accountId: string) => { return array.filter((i) => i.accountId !== accountId) };

	refreshTokens = removeFromArray(refreshTokens, user.accountId);
	accessTokens = removeFromArray(accessTokens, user.accountId);

	const deviceId = StringsHelper.uuidRp();
	const accessToken = await JwtHelper.createAccessToken(
		user,
		clientId,
		requestBody.grant_type,
		deviceId,
		8,
	);
	const refreshToken = await JwtHelper.createRefreshToken(
		user,
		clientId,
		requestBody.grant_type,
		deviceId,
		24,
	);

	const decodedAccess = JwtHelper.isJwtPayload(jwt.decode(accessToken) as JwtPayload);
	const decodedRefresh = JwtHelper.isJwtPayload(jwt.decode(refreshToken) as JwtPayload);

	if (!decodedAccess || !decodedRefresh) {
		return c.sendError(nexus.authentication.validationFailed.with("Failed to decode token"));
	}

	const expiresIn = (date: Date, hours: number) => Math.round((StringsHelper.dateAddTime(new Date(date), hours).getTime() - new Date().getTime()) / 1000);
	const expiresAt = (date: Date, hours: number) => StringsHelper.dateAddTime(new Date(date), hours).toISOString();

	return c.json({
		access_token: `eg1~${accessToken}`,
		expires_in: expiresIn(decodedAccess.creationDate, decodedAccess.hoursExpire),
		expires_at: expiresAt(decodedAccess.creationDate, decodedAccess.hoursExpire),
		token_type: "bearer",
		refresh_token: `eg1~${refreshToken}`,
		refresh_expires: expiresIn(decodedRefresh.creationDate, decodedRefresh.hoursExpire),
		refresh_expires_at: expiresAt(decodedRefresh.creationDate, decodedRefresh.hoursExpire),
		account_id: user.accountId,
		client_id: clientId,
		internal_client: true,
		client_service: "fortnite",
		displayName: user.username,
		app: "fortnite",
		in_app_id: user.accountId,
		device_id: deviceId,
	});
});

app.post("/account/api/oauth/launcher/credentials", async (c) => {
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.sendError(nexus.internal.jsonParsingFailed);
	}

	const email = body.email;
	const password = body.password;

	const user = await UserWrapper.findUserByEmail(email);
	if (!user)
		return c.sendError(
			nexus.account.accountNotFound.with(
				`Account with email ${email} not found`,
			),
		);

	if (!(await Bun.password.verify(password, user.password))) {
		return c.sendError(nexus.authentication.oauth.invalidAccountCredentials);
	}

	return c.json({
		email: user.email,
		displayName: user.username,
		role: "USER",
		discordId: user.discordId,
	});
});

app.get("/account/api/oauth/verify", async (c) => {
	const auth = c.req.header("authorization");
	if (!auth) return c.sendError(nexus.authentication.invalidHeader);
	const token = auth.replace("bearer ", "");
	const decodedToken = JwtHelper.isJwtPayload(
		jwt.decode(token.replace("eg1~", "")) as JwtPayload,
	);

	const user = await getAuthUser(c);
	if (!user) {
		Logger.error("User not found");
		return c.sendError(nexus.account.accountNotFound);
	}

	return c.json({
		token: token,
		session_id: decodedToken.jti,
		token_type: "bearer",
		client_id: decodedToken.clid,
		internal_client: true,
		client_service: "fortnite",
		account_id: user.accountId,
		expires_in: Math.round(
			(StringsHelper.dateAddTime(
				new Date(decodedToken.creationDate),
				decodedToken.hoursExpire,
			).getTime() -
				new Date().getTime()) /
			1000,
		),
		expires_at: StringsHelper.dateAddTime(
			new Date(decodedToken.creationDate),
			decodedToken.hoursExpire,
		).toISOString(),
		auth_method: decodedToken.am,
		display_name: user.username,
		app: "fortnite",
		in_app_id: user.accountId,
		device_id: decodedToken.dvid,
	});
});

app.delete("/account/api/oauth/sessions/kill", (c) => {
	return c.sendStatus(204);
});

app.delete("/account/api/oauth/sessions/kill/:token", async (c) => {
	const token = c.req.param("token");

	const accessIndex = accessTokens.findIndex((i) => i.token === token);

	if (accessIndex !== -1) {
		const { accountId } = accessTokens[accessIndex];

		accessTokens.splice(accessIndex, 1);

		const refreshIndex = refreshTokens.findIndex(
			(i) => i.accountId === accountId,
		);
		if (refreshIndex !== -1) refreshTokens.splice(refreshIndex, 1);
	}

	const clientIndex = clientTokens.findIndex((i) => i.token === token);
	if (clientIndex !== -1) clientTokens.splice(clientIndex, 1);

	await db.delete(tokens).where(eq(tokens.token, token.replace("eg1~", "")));

	return c.sendStatus(204);
});

app.get("/api/v1/oauth/discord/gettoken", async (c) => {
	const code = c.req.query("code");
	if (!code) return c.sendError(nexus.basic.badRequest);

	const formData = new url.URLSearchParams({
		client_id: "1178308081923391509",
		client_secret: "CD-U00GsEJm_KewN93L326pkFBYV1-e7",
		grant_type: "authorization_code",
		code: code,
		redirect_uri: "http://localhost:3000/api/v1/oauth/discord/gettoken",
	});

	const headers = {
		"Content-Type": "application/x-www-form-urlencoded",
	};

	const response = await fetch("https://discord.com/api/oauth2/token", {
		method: "POST",
		body: formData,
		headers: headers,
	});

	if (!response.ok) return c.sendError(nexus.basic.badRequest);

	const json: any = await response.json();

	const accessToken = json.access_token;

	return c.json(accessToken);
});

app.get("/api/v1/oauth/discord/redirect", async (c) => {
	const code = c.req.query("code");
	if (!code) return c.sendError(nexus.basic.badRequest);

	const formData = new url.URLSearchParams({
		client_id: "1178308081923391509",
		client_secret: "CD-U00GsEJm_KewN93L326pkFBYV1-e7",
		grant_type: "authorization_code",
		code: code,
		redirect_uri: "http://localhost:3000/api/v1/oauth/discord/redirect",
	});

	const headers = {
		"Content-Type": "application/x-www-form-urlencoded",
	};

	const response = await fetch("https://discord.com/api/oauth2/token", {
		method: "POST",
		body: formData,
		headers: headers,
	});

	if (!response.ok) return c.sendError(nexus.basic.badRequest);

	const json: any = await response.json();

	const accessToken = json.access_token;

	const userInfo = await fetch("https://discord.com/api/users/@me", {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!userInfo.ok) return c.sendError(nexus.basic.badRequest);

	const userJson: any = await userInfo.json();

	//create new exchange code
	const exchangeCode = StringsHelper.uuidRp();

	const user = await UserWrapper.findUserByDiscordId(userJson.id);
	if (!user) return c.sendError(nexus.account.accountNotFound.variable([userJson.id]));

	exchangeCodes.push({
		exchangeCode: exchangeCode,
		accountId: user.accountId,
	});

	return c.redirect(
		`http://localhost:3000/api/v1/oauth/discord/redirect/success?exchangecode=${exchangeCode}`,
	);
});

//create route for success and display edxchangecode with html
app.get("/api/v1/oauth/discord/redirect/success", async (c) => {
	const exchangeCode = c.req.query("exchangecode");
	if (!exchangeCode) return c.sendError(nexus.basic.badRequest);

	return c.html(`
    <html>
        <head>
            <title>Success</title>
        </head>
        <body>
            <h1>Success</h1>
            <p>Exchange code: ${exchangeCode}</p>
        </body>
    </html>
    `);
});
