import app from "..";
import { nexus } from "../aids/error/error.utility";
import { getVersion } from "../aids/request/version.utility";
import { getAuthUser } from "../middleware/auth.middleware";
import { OAuthUtility } from "../aids/oauth/clients.utility";
import { hotfixOverrides } from "./overrides";

app.get("/lightswitch/api/service/Fortnite/status", async (c) => {
    const user = await getAuthUser(c);
    let userAllowed = ["PLAY", "DOWNLOAD"];

    if (!user && !OAuthUtility.validateClient(c)) {
        return c.sendError(nexus.authentication.invalidToken.variable([c.req.header("Authorization")!]));
    }

    if (user?.banned) userAllowed = ["NONE"];

    return c.json({
        serviceInstanceId: "fortnite",
        status: "UP",
        message: "Nexus is up.",
        maintenanceUri: "https://discord.gg/nexusfn",
        overrideCatalogIds: ["a7f138b2e51945ffbfdacc1af0541053"],
        allowedActions: userAllowed,
        banned: user?.banned || false,
        launcherInfoDTO: {
            appName: "Fortnite",
            catalogItemId: "4fe75bbc5a674f4f9b356b5c90567da5",
            namespace: "fn",
        },
    });
});

app.get("/lightswitch/api/service/bulk/status", async (c) => {

    const user = await getAuthUser(c)

    let userAllowed = ["PLAY", "DOWNLOAD"];
    if (user && user.banned) userAllowed = ["NONE"];

    return c.json([
        {
            serviceInstanceId: "fortnite",
            status: "UP",
            message: "Nexuss is up.",
            maintenanceUri: "https://discord.gg/nexusfn",
            overrideCatalogIds: ["a7f138b2e51945ffbfdacc1af0541053"],
            allowedActions: user ? userAllowed : ["NONE"],
            banned: user ? user.banned : false,
            launcherInfoDTO: {
                appName: "Fortnite",
                catalogItemId: "4fe75bbc5a674f4f9b356b5c90567da5",
                namespace: "fn",
            },
        },
    ]);
});

app.get("/fortnite/api/version", (c) => {

    const memory = getVersion(c)
    if (memory.build === 0) return c.sendError(nexus.internal.invalidUserAgent)

    return c.json({
        app: "fortnite",
        serverDate: new Date().toISOString(),
        overridePropertiesVersion: "unknown",
        cln: memory.cl,
        build: memory.build,
        moduleName: "Fortnite-Core",
        buildDate: config.dates.seasonStart,
        version: memory.build,
        branch: `Release-${memory.build}`,
        modules: {
            "Epic-LightSwitch-AccessControlCore": {
                cln: "17237679",
                build: "b2130",
                buildDate: config.dates.currentTime,
                version: "1.0.0",
                branch: "trunk",
            },
            "epic-xmpp-api-v1-base": {
                cln: "5131a23c1470acbd9c94fae695ef7d899c1a41d6",
                build: "b3595",
                buildDate: config.dates.currentTime,
                version: "0.0.1",
                branch: "master",
            },
            "epic-common-core": {
                cln: "17909521",
                build: "3217",
                buildDate: config.dates.currentTime,
                version: "3.0",
                branch: "TRUNK",
            },
        },
    });
});

app.get("/fortnite/api/v2/versioncheck/:os", (c) => {

    const version = c.req.query("version");
    if (!version) return c.sendError(nexus.basic.badRequest);

    const allowedVersions = ["++Fortnite+Release-15.30-CL-15341163-Windows"];

    if (!allowedVersions.includes(version) || hotfixOverrides.length > 0) return c.json({
        "type": "SOFT_UPDATE"
    })

    return c.json({
        type: "NO_UPDATE",
    });
});