import qs from "qs";

import app from "..";
import { nexus } from "../aids/error/error.utility";
import { StringsHelper } from "../aids/string/strings.aid";
import { getVersion } from "../aids/request/version.utility";
import { getAuthUser } from "../middleware/auth.middleware";
import { MatchmakingPayload } from "../types/matchmaking";
import { CryptoHelper } from "../aids/crypto/crypto.utility";

const buildUniqueId: any = {};

app.get("/fortnite/api/matchmaking/session/findPlayer/.*", (c) =>
    c.sendStatus(200),
);

app.get("/fortnite/api/matchmaking/session/:sessionId", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.sendError(nexus.authentication.invalidToken.variable([c.req.header("Authorization")!]));

    const sessionId = c.req.param("sessionId");

    console.info("Trying to join", sessionId);

    return c.json({
        id: sessionId,
        ownerId: StringsHelper.uuidRp(),
        ownerName: "Elixir.SO",
        serverName: `Elixir.`, //TODO: Make it use actual server here
        serverAddress: "127.0.0.1", //TODO: Make it use actual server here
        serverPort: 7777, //TODO: Make it use actual server here
        maxPublicPlayers: 100,
        openPublicPlayers: 100,
        maxPrivatePlayers: 100,
        openPrivatePlayers: 100,
        attributes: {},
        publicPlayers: [],
        privatePlayers: [],
        totalPlayers: 0,
        allowJoinInProgress: false,
        shouldAdvertise: false,
        isDedicated: false,
        usesStats: true,
        allowInvites: false,
        usesPresence: false,
        allowJoinViaPresence: true,
        allowJoinViaPresenceFriendsOnly: false,
        buildUniqueId: buildUniqueId[user.accountId],
        lastUpdated: new Date().toISOString(),
        started: false,
    });
});

app.post("/fortnite/api/matchmaking/session/:sessionId/join", (c) => c.sendStatus(204));

app.post("/fortnite/api/matchmaking/session/matchMakingRequest", (c) => {
    return c.json([]);
});

app.get("/fortnite/api/game/v2/matchmaking/account/:accountId/session/:sessionId", async (c) => {
    return c.json({
        accountId: c.req.param("accountId"),
        sessionId: c.req.param("sessionId"),
        key: "0UPWOppi4YXKd/0I4YhCuwqk0FkiStEiEByjqrvcumc=",
    })
});

app.get("/fortnite/api/game/v2/matchmakingservice/ticket/player/:accountId", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.sendError(nexus.authentication.invalidToken.variable([c.req.header("Authorization")!]));

    const bucketId = c.req.query("bucketId");
    if (!bucketId) return c.sendError(nexus.matchmaking.invalidBucketId);

    const [buildId, ,region] = bucketId.split(":");
    if (!region) return c.sendError(nexus.matchmaking.invalidBucketId);

    buildUniqueId[user.accountId] = buildId;

    const playerCustomKey = qs.parse(c.req.queries.toString(), { ignoreQueryPrefix: true })["player.option.customKey"] as string;
    const memory = getVersion(c);
    const unixTime = new Date().getMilliseconds().toString();
    const signatureHash = await Bun.password.hash(`${user.accountId}:${unixTime}:${config.JWT_SECRET}`); //TODO Compare this later with the real signature

    const payload: MatchmakingPayload = {
        playerId: user.accountId,
        partyPlayerIds: [], // TODO: Fetch party members
        bucketId: bucketId,
        attributes: {
            "player.subregions": region,
            "player.season": memory.season,
            "player.option.partyId": "none", // TODO: Fetch party id
            "player.userAgent": memory.cl,
            "player.platform": "Windows",
            "player.option.linkType": "DEFAULT",
            "player.preferredSubregion": region,
            "player.input": "KBM",
            "playlist.revision": 1,
            ...(playerCustomKey && { customKey: playerCustomKey }),
            "player.option.fillTeam": false,
            "player.option.linkCode": playerCustomKey || "none",
            "player.option.uiLanguage": "en",
            "player.privateMMS": !!playerCustomKey,
            "player.option.spectator": false,
            "player.inputTypes": "KBM",
            "player.option.groupBy": playerCustomKey || "none",
            "player.option.microphoneEnabled": true,
        },
        expireAt: new Date(Date.now() + 1000 * 30).toISOString(),
        nonce: signatureHash,
    };

    const encryptedPayload = CryptoHelper.encrypt(JSON.stringify(payload), "Nexus");

    return c.json({
        serviceUrl: config.matchmakerUrl,
        ticketType: "mms-player",
        payload: encryptedPayload,
        signature: signatureHash,
    });
});