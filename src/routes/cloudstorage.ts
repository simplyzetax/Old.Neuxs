import path from "node:path";
import fs from "node:fs/promises";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import app from "..";
import { CryptoHelper } from "../aids/crypto/crypto.utility";
import { nexus } from "../aids/error/error.utility";
import { IReplaceableHotfix, hotfixOverrides } from "./overrides";
import { StringsHelper } from "../aids/string/strings.aid";
import { getVersion } from "../aids/request/version.utility";
import { getAuthUser } from "../middleware/auth.middleware";

const s3Client = new S3Client({
    region: 'auto',
    endpoint: 'https://018c0016ff5a7036ad1f7e576e5da792.r2.cloudflarestorage.com/nexus',
    credentials: {
        accessKeyId: "37ddc36f81fbb183628ae5beb01acf59",
        secretAccessKey: "2d40f74534f5b8571db175d4f9afa7fc4389fdc88625d8c5c337cee12910e70a"
    }
});


const cloudFiles: any[] = [];

app.get("/fortnite/api/cloudstorage/system", async (c) => {

    if (cloudFiles.length > 0 && hotfixOverrides.length === 0) {
        return c.json(cloudFiles);
    }

    const dir = path.join(import.meta.dir, "../../", "hotfixes");
    const dirRead = await fs.readdir(dir);

    cloudFiles.splice(0, cloudFiles.length);

    const promises = dirRead.filter(name => name.toLowerCase().endsWith(".ini")).map(async (name) => {
        const filePath = path.join(dir, name);
        let file = Bun.file(filePath);
        const parsedStats = await fs.stat(filePath);

        const useHotfixes = hotfixOverrides.length > 0;
        const dataToHash = useHotfixes ? JSON.stringify(hotfixOverrides) : JSON.stringify(file);
        const length = useHotfixes ? dataToHash.length : (await file.text()).length;
        const uploaded = useHotfixes ? Date.now() : parsedStats.mtimeMs;

        cloudFiles.push({
            uniqueFilename: name,
            filename: name,
            hash: CryptoHelper.sha1(dataToHash),
            hash256: CryptoHelper.sha256(dataToHash),
            length: length,
            contentType: "application/octet-stream",
            uploaded: uploaded,
            storageType: "S3",
            storageIds: { id: StringsHelper.uuidRp() },
            doNotCache: true,
        });
    });

    await Promise.all(promises);
    return c.json(cloudFiles);
});

app.get("/fortnite/api/cloudstorage/system/:file", async (c) => {
    const requestedFile = c.req.param("file");

    try {
        const file = Bun.file(path.join(import.meta.dir, "../../", "hotfixes", requestedFile));
        let textFile = await file.text();

        textFile = hotfixOverrides.reduce((text: string, override: IReplaceableHotfix) =>
            `${text}\n[${override.header}]\n${override.key}=${override.value}`, textFile)
            .replace(/\[\[/g, "[").replace(/\]\]/g, "]")
            .replace(/^(#|;).*/gm, "").replace(/\n{2,}/g, "\n")

        return c.sendIni(textFile);
    } catch {
        return c.sendError(nexus.cloudstorage.fileNotFound.originatingService(import.meta.file.replace(".ts", "")))
    }
});

app.get("/fortnite/api/cloudstorage/user/:accountId", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.sendError(nexus.authentication.authenticationFailed.variable(["token"]));

    let content, uploaded;

    try {
        const getObject = await s3Client.send(new GetObjectCommand({ Bucket: "nexus", Key: `user/${user.accountId}/ClientSettings.sav` }));
        if (!getObject.Body) return c.sendError(nexus.cloudstorage.fileNotFound.originatingService(import.meta.file.replace(".ts", "")));
        content = await getObject.Body.transformToString();
        uploaded = getObject.LastModified;
    } catch {
        content = new Date().toISOString();
        uploaded = content;
    }

    return c.json([{
        uniqueFilename: "ClientSettings.Sav",
        filename: "ClientSettings.Sav",
        hash: CryptoHelper.sha1(content),
        hash256: CryptoHelper.sha256(content),
        length: Buffer.byteLength(content),
        contentType: "application/octet-stream",
        uploaded,
        storageType: "S3",
        storageIds: {},
        accountId: user.accountId,
        doNotCache: false
    }]);
});

app.get("/fortnite/api/cloudstorage/user/:accountId/:file", async (c) => {

    const user = await getAuthUser(c);
    if (!user) return c.sendError(nexus.authentication.authenticationFailed.variable(["token"]));

    const filename = c.req.param("file").toLowerCase();

    if (filename !== "clientsettings.sav") {
        return c.sendStatus(404);
    }

    try {
        const getObject = await s3Client.send(new GetObjectCommand({
            Bucket: "nexus",
            Key: `user/${user.accountId}/ClientSettings.sav`
        }));
        if (!getObject.Body) return c.sendError(nexus.cloudstorage.fileNotFound.originatingService(import.meta.file.replace(".ts", "")));

        const buffer = getObject.Body;
        const content = await buffer.transformToString();

        return c.body(content);
    } catch {
        const buffer = Buffer.alloc(1);
        buffer.write(user.toString(), 0);
        const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        return c.body(arrayBuffer as ArrayBuffer);
    }

});

app.put("/fortnite/api/cloudstorage/user/:accountId/:file", async (c) => {

    const user = await getAuthUser(c);
    if (!user) return c.sendError(nexus.authentication.authenticationFailed.variable(["token"]));

    const filename = c.req.param("file").toLowerCase();

    if (filename !== "clientsettings.sav") {
        return c.sendStatus(404);
    }

    const rawBody = await c.req.arrayBuffer();
    const buffer = Buffer.from(rawBody);

    if (c.req.param("file").toLowerCase() !== "clientsettings.sav") return c.sendStatus(204);

    await s3Client.send(new PutObjectCommand({
        Bucket: "nexus",
        Key: `user/${user.accountId}/ClientSettings.sav`,
        Body: buffer
    }));

    return c.sendStatus(204);

});