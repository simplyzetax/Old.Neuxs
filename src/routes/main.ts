import app from "..";

app.post("/fortnite/api/game/v2/tryPlayOnPlatform/account/:accountId", (c) => {
    c.res.headers.set("Content-Type", "text/plain");
    return c.body(`true`);
})

app.get("/fortnite/api/game/v2/enabled_features", (c) => {
    return c.json([]);
});