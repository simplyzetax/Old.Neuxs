import jwt, { JwtPayload } from "jsonwebtoken";

import { StringsHelper } from "../string/strings.aid";
import { User } from "../../models/db/user";
import { db } from "../../database/client";
import { NewToken, tokens } from "../../models/db/token";
import { and, eq } from "drizzle-orm";
import Logger from "../logging/logging.utility";

export namespace JwtHelper {
    export async function createClientToken(clientId: string, grantType: string, ipAddress: string, hoursToExpire: number) {
        const payload = {
            payloadId: StringsHelper.encodeBase64(StringsHelper.uuidRp()),
            clientService: "fortnite",
            tokenType: "s",
            multiFactorAuth: false,
            clientId,
            internalClient: true,
            authMethod: grantType,
            jwtId: StringsHelper.uuidRp(),
            creationDate: new Date(),
            hoursExpire: hoursToExpire
        };

        const clientToken = jwt.sign(payload, config.JWT_SECRET, { expiresIn: `${hoursToExpire}h` });

        clientTokens.push({ ip: ipAddress, token: `eg1~${clientToken}` });
        return clientToken;
    }

    export async function createAccessToken(user: User, clientId: string, grantType: string, deviceId: string, hoursToExpire: number) {
        const payload = {
            app: "fortnite",
            subject: user.accountId,
            deviceId,
            multiFactorAuth: false,
            clientId,
            displayName: user.username,
            authMethod: grantType,
            payloadId: StringsHelper.encodeBase64(StringsHelper.uuid()),
            internalAccountId: user.accountId,
            securityLevel: 1,
            clientService: "fortnite",
            tokenType: "s",
            internalClient: true,
            jwtId: StringsHelper.uuidRp(),
            creationDate: new Date(),
            hoursExpire: hoursToExpire
        };

        const accessToken = jwt.sign(payload, config.JWT_SECRET, { expiresIn: `${hoursToExpire}h` });
        accessTokens.push({ accountId: user.accountId, token: `eg1~${accessToken}` });

        const newToken: NewToken = {
            accountId: user.accountId,
            token: `eg1~${accessToken}`,
            type: "access",
            ip: null
        }

        Logger.info(`Created access token for ${user.accountId}`);

        await db.delete(tokens).where(and(eq(tokens.accountId, user.accountId), eq(tokens.type, "access"))).execute();
        await db.insert(tokens).values(newToken).execute();

        return accessToken;
    }

    export async function createRefreshToken(user: User, clientId: string, grantType: string, deviceId: string, hoursToExpire: number) {
        const payload = {
            subject: user.accountId,
            deviceId,
            tokenType: "r",
            clientId,
            authMethod: grantType,
            jwtId: StringsHelper.uuidRp(),
            creationDate: new Date(),
            hoursExpire: hoursToExpire
        };

        const refreshToken = jwt.sign(payload, config.JWT_SECRET, { expiresIn: `${hoursToExpire}h` });
        refreshTokens.push({ accountId: user.accountId, token: `eg1~${refreshToken}` });

        const newToken: NewToken = {
            accountId: user.accountId,
            token: `eg1~${refreshToken}`,
            type: "refresh",
            ip: undefined
        }

        await db.delete(tokens).where(and(eq(tokens.accountId, user.accountId), eq(tokens.type, "refresh"))).execute();
        await db.insert(tokens).values(newToken)

        return refreshToken;
    }

    export function isJwtPayload(token: JwtPayload): JwtPayload {
        if (typeof token.creationDate !== 'string' || typeof token.hoursExpire !== 'number') {
            throw new Error('Invalid JwtPayload');
        }
        return token;
    }

    export function isTokenExpired(token: string) {
        const decoded = jwt.decode(token);
        if (!decoded) return false;

        if (Object.prototype.hasOwnProperty.call(decoded, "refresh_token")) return false;

        const decodedToken = JwtHelper.isJwtPayload(decoded as JwtPayload);
        return StringsHelper.dateAddTime(new Date(decodedToken.creationDate), decodedToken.hoursExpire) < new Date();
    }
}