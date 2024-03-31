import { eq, sql } from "drizzle-orm";

import Logger from "../../aids/logging/logging.utility";
import { User, users } from "../../models/db/user";
import { db } from "../client";

const p1 = db
    .select()
    .from(users)
    .where(eq(users.accountId, sql.placeholder('accountId')))
    .prepare("findUserById");

const p2 = db
    .select()
    .from(users)
    .where(eq(users.email, sql.placeholder('email')))
    .prepare("findUserByEmail");

const p3 = db
    .select()
    .from(users)
    .where(eq(users.discordId, sql.placeholder('discordId')))
    .prepare("findUserByDiscordId");

const p4 = db
    .select()
    .from(users)
    .where(eq(users.username, sql.placeholder('username')))
    .prepare("findUserByUsername");

const p5 = db
    .select()
    .from(users)
    .where(eq(users.usernameLower, sql.placeholder('usernameLower')))
    .prepare("findUserByUsernameLower");

const userCache = new Map<string, User>();

export class UserWrapper {
    static async findUserById(accountId: string): Promise<User | undefined> {
        if (userCache.has(accountId)) {
            Logger.success(`UserWrapper.findUserById(${accountId}) - Cache hit`);
            return userCache.get(accountId);
        }
        const [user] = await p1.execute({ accountId: accountId });
        if (!user) return undefined;

        userCache.set(accountId, user);
        return user;
    }

    static async findUserByEmail(email: string): Promise<User | undefined> {
        const userRows = await p2.execute({ email: email });
        if (userRows.length == 0) return undefined;

        return userRows[0];
    }

    static async findUserByDiscordId(discordId: string): Promise<User | undefined> {
        const userRows = await p3.execute({ discordId: discordId });
        if (userRows.length == 0) return undefined;

        return userRows[0];
    }

    static async findUserByUsername(username: string): Promise<User | undefined> {
        const userRows = await p4.execute({ username: username });
        if (userRows.length == 0) return undefined;

        return userRows[0];
    }

    static async findUserByUsernameLower(usernameLower: string): Promise<User | undefined> {
        const userRows = await p5.execute({ usernameLower: usernameLower });
        if (userRows.length == 0) return undefined;

        return userRows[0];
    }

    static async createUser(accountId: string, username: string, usernameLower: string, discordId: string, email: string, password: string): Promise<void> {
        await db.insert(users).values({
            accountId,
            username,
            usernameLower,
            discordId,
            email,
            password,
            reports: 0,
            banned: false,
        });
    }
}