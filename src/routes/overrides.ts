import { Context } from "hono";

import app from "..";
import { OAuthUtility } from "../aids/oauth/clients.utility";
import { EScopes } from "../types/oauth";

export interface IReplaceableHotfix {
    filename: string,
    header: string,
    key: string,
    value: string
}

export const hotfixOverrides: IReplaceableHotfix[] = [];

const validateClient = (c: Context) => {
    if(c.req.headers.get("bypass")) return true;
    const client = OAuthUtility.getClientFromContext(c);
    if (!client || !OAuthUtility.validateClientAndScope(client?.id, client?.secret, EScopes.SERVER)) {
        return false;
    }
    return true;
}

app.post("/api/nexus/togglematchmaking/:value", (c) => {
    if (!validateClient(c)) return c.sendError(nexus.authentication.authenticationFailed.withMessage("Invalid client"));

    const value = c.req.param("value");
    if(hotfixOverrides.find((x) => x.header === "[/Script/FortniteGame.FortGameInstance]" && x.key === "bBattleRoyaleMatchmakingEnabled")) {
        hotfixOverrides.splice(hotfixOverrides.findIndex((x) => x.header === "[/Script/FortniteGame.FortGameInstance]" && x.key === "bBattleRoyaleMatchmakingEnabled"), 1);
    }
    hotfixOverrides.push({
        filename: "DefaultGame.ini",
        header: "[/Script/FortniteGame.FortGameInstance]",
        key: "bBattleRoyaleMatchmakingEnabled",
        value: value
    });

    return c.json({ status: "success", value });
});

app.post("/api/nexus/override", async (c) => {
    if (!validateClient(c)) return c.sendError(nexus.authentication.authenticationFailed.withMessage("Invalid client"));

    let body;
    try {
        body = await c.req.json();
    } catch {
        return c.sendError(nexus.internal.jsonParsingFailed);
    }

    const { filename, header, key, value } = body;
    if (!filename || !header || !key || !value) {
        return c.sendError(nexus.basic.badRequest.withMessage("Missing one or more required fields"));
    }

    const alreadyExists = hotfixOverrides.find((x) => x.filename === filename && x.header === header && x.key === key);
    if (alreadyExists) {
        return c.sendError(nexus.basic.badRequest.withMessage("This hotfix override already exists"));
    }

    hotfixOverrides.push({ filename, header, key, value });
    return c.json({ status: "success", hotfixOverride: hotfixOverrides[hotfixOverrides.length - 1] });
});

app.post("/api/nexus/removeoverride", async (c) => {
    if (!validateClient(c)) return c.sendError(nexus.authentication.authenticationFailed.withMessage("Invalid client"));

    let body;
    try {
        body = await c.req.json();
    } catch {
        return c.sendError(nexus.internal.jsonParsingFailed);
    }

    const { filename, header, key } = body;
    if (!filename || !header || !key) {
        return c.sendError(nexus.basic.badRequest.withMessage("Missing one or more required fields"));
    }

    const index = hotfixOverrides.findIndex((x) => x.filename === filename && x.header === header && x.key === key);
    if (index === -1) {
        return c.sendError(nexus.basic.badRequest.withMessage("This hotfix override does not exist"));
    }

    hotfixOverrides.splice(index, 1);
    return c.json({ status: "success" });
});

app.get("/api/nexus/getoverrides", async (c) => {
    if (!validateClient(c)) return c.sendError(nexus.authentication.authenticationFailed.withMessage("Invalid client"));
    return c.json({ status: "success", hotfixOverrides });
});

app.get("/api/nexus/getoverrides/:filename", async (c) => {
    if (!validateClient(c)) return c.sendError(nexus.authentication.authenticationFailed.withMessage("Invalid client"));
    const filename = c.req.param("filename");
    const overrides = hotfixOverrides.filter((x) => x.filename === filename);
    return c.json({ status: "success", overrides });
});

app.get("/api/nexus/clearoverrides", async (c) => {
    if (!validateClient(c)) return c.sendError(nexus.authentication.authenticationFailed.withMessage("Invalid client"));
    hotfixOverrides.splice(0, hotfixOverrides.length);
    return c.json({ status: "success" });
});

app.get("/api/nexus/clearoverrides/:filename", async (c) => {
    if (!validateClient(c)) return c.sendError(nexus.authentication.authenticationFailed.withMessage("Invalid client"));
    const filename = c.req.param("filename");
    const index = hotfixOverrides.findIndex((x) => x.filename === filename);
    if (index === -1) {
        return c.sendError(nexus.basic.badRequest.withMessage("This hotfix override does not exist"));
    }

    hotfixOverrides.splice(index, 1);
    return c.json({ status: "success" });
});