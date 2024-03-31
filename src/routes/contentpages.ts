import app from "..";
import { getContentPages } from "../aids/shop/shop.aid";

app.get("/content/api/pages/fortnite-game", async (c) => {

    return c.json(await getContentPages(c))

});