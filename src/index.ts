import { Hono } from 'hono'
import path from 'path';
import { prettyJSON } from 'hono/pretty-json';
import Logger from './aids/logging/logging.utility';
import { addIniSend, addSendStatus, addErrorSend } from './middleware/utility.middleware';
import { loadRoutes } from './aids/routes/autoroutes.aid';
import { ConfigHelper } from './aids/config/config.utility';

import ("./global/variables");
import ("./global/functions");

// App initialization
export const app = new Hono()
export default app;

while(app === undefined || globalThis.config === undefined) {
    globalThis.config = await ConfigHelper.validateConfig()
    await new Promise((resolve) => setTimeout(resolve, 1000));
}

// Middleware
app.use('*', async (c, next) => addSendStatus(c, next));
app.use('*', async (c, next) => addErrorSend(c, next));
app.use('*', async (c, next) => addIniSend(c, next));
app.use('*', prettyJSON())

// Routes
app.get("/favicon.ico", async (c) => {
    return c.body(await Bun.file(path.join(import.meta.dir, '../public/blackhole.ico')).arrayBuffer());
});

app.get("/public/:file", async (c) => {
    const { file } = c.req.param();
    return c.body(await Bun.file(path.join(import.meta.dir, '../public/', c.req.param("file"))).arrayBuffer());
});

await loadRoutes('./src/routes/');

Logger.success("Nexus started successfully!");

// 404 handler
app.notFound((c) => {
    Logger.warning(`404: ${c.req.url}`);
    return c.sendError(nexus.basic.notFound);
});