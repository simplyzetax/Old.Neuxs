import { Context, ContextRenderer, MiddlewareHandler } from "hono";
import jwt, { JwtPayload } from "jsonwebtoken";

import Logger from "../aids/logging/logging.utility";
import { User } from "../models/db/user";
import { StringsHelper } from "../aids/string/strings.aid";
import { UserWrapper } from "../database/wrappers/user.wrapper";
import { accessToken } from "../types/tokens";
import { createMiddleware } from "hono/factory";

export const getAuthUser = async (c: Context): Promise<User | undefined> => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
        Logger.error("Invalid token E");
        return undefined;
    }

    const token = authHeader.replace("bearer eg1~", "");
    const decodedToken = jwt.decode(token) as JwtPayload;
    if (!decodedToken || !decodedToken.subject || !accessTokens.find((i: accessToken) => i.token === `eg1~${token}`)) {
        Logger.error("Invalid token A");
        return undefined;
    }

    if (StringsHelper.dateAddTime(new Date(decodedToken.creation_date), decodedToken.hours_expire).getTime() <= new Date().getTime()) {
        Logger.error("Invalid token B");
        return undefined;
    }

    let user = await UserWrapper.findUserById(decodedToken.subject);
    return user;
};

export const authMiddleware = () => {
    return createMiddleware(async (c, next) => {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) {
            Logger.error("Invalid token E");
            throw new Error("Invalid token E");
        }

        const token = authHeader.replace("bearer eg1~", "");
        const decodedToken = jwt.decode(token) as JwtPayload;
        if (!decodedToken || !decodedToken.subject || !accessTokens.find((i: accessToken) => i.token === `eg1~${token}`)) {
            Logger.error("Invalid token A");
            throw new Error("Invalid token A");
        }

        if (StringsHelper.dateAddTime(new Date(decodedToken.creation_date), decodedToken.hours_expire).getTime() <= new Date().getTime()) {
            Logger.error("Invalid token B");
            throw new Error("Invalid token B");
        }

        const user = await UserWrapper.findUserById(decodedToken.subject);
        if (!user) return c.json(nexus.account.accountNotFound)
        c.user = user;

        await next();
    })
}