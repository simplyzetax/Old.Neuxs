import { app } from "..";
import { getShop } from "../aids/shop/shop.aid";

app.get("/fortnite/api/storefront/v2/catalog", async (c) => {
	return c.json(await getShop())
});