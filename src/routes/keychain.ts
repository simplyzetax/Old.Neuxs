import destr from "destr";
import path from "path";

import app from "..";

const keychain = destr(
	await Bun.file(path.join(import.meta.dir, "../../", "resources", "keychain.json")).text(),
);

app.get("/fortnite/api/storefront/v2/keychain", (c) => {
	return c.json(keychain);
});