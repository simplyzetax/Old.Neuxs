import { Context } from "hono";
import Logger from "../logging/logging.utility";

export interface IVersion {
    season: number;
    build: number;
    cl: string;
    lobby: string;
}

export function getVersion(c: Context): IVersion {

    const officialRegex = new RegExp(/(.*)\/(.*)-CL-(\d+)(\s+\((.*?)\))?\s+(\w+)\/(\S*)(\s*\((.*?)\))?/);

    const memory: IVersion = {
        season: 0,
        build: 0.0,
        cl: "0",
        lobby: "LobbySeason0",
    };

    const userAgent = c.req.header("user-agent");
    if (!userAgent) {
        console.error("No user agent provided");
        return memory;
    }

    const buildIDMatch = userAgent.match(/-(\d+)[, ]/);
    const buildMatch = userAgent.match(/Release-(\d+\.\d+)/);
    const officialMatch = userAgent.match(officialRegex);

    if (officialMatch) {
        const build = officialMatch[7];
        memory.season = Number(build.split(".")[0]);
        memory.build = Number(build);
        memory.lobby = `LobbySeason${memory.season}`;
    }

    if (buildIDMatch) {
        memory.cl = buildIDMatch[1];
    }

    if (buildMatch) {
        const build = buildMatch[1];
        memory.season = Number(build.split(".")[0]);
        memory.build = Number(build);
        memory.lobby = `LobbySeason${memory.season}`;
    }

    if (Number.isNaN(memory.season)) {
        memory.season = getSeasonFromCL(memory.cl);
        memory.build = memory.season;
        memory.lobby = `LobbySeason${memory.season}`;
    }

    return memory;
}

function getSeasonFromCL(cl: string): number {
    const clNumber = Number(cl);
    if (Number.isNaN(clNumber) || clNumber < 3724489) {
        return 0;
    } else if (clNumber <= 3790078) {
        return 1;
    } else {
        return 2;
    }
}