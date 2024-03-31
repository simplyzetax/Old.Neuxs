import { z } from "zod";

import { ConfigHelper, configSchema } from "../aids/config/config.utility";
import * as nexusModule from "../aids/error/error.utility";
import { db } from "../database/client";
import { tokens } from "../models/db/token";
import {
	accessToken,
	clientToken,
	exchangeCode,
	refreshToken,
} from "../types/tokens";

// Global variable declarations
declare global {
	/*
	 * Config is used to store the config and access it from anywhere
	 */
	var config: z.infer<typeof configSchema>;

	/*
	 * Access tokens are used to authenticate requests
	 */
	var accessTokens: accessToken[];

	/*
	 * Refresh tokens are used to exchange for access tokens
	 */
	var refreshTokens: refreshToken[];

	/*
	 * Client tokens are used to exchange for access tokens
	 */
	var clientTokens: clientToken[];

	/*
	 * Exchange codes are used to exchange for access tokens
	 */
	var exchangeCodes: exchangeCode[];

	/**
	 * Nexus error handler
	 */
	var nexus: typeof nexusModule.nexus;

	/**
	 * Executes functions in parallel
	 * @param functions Functions to execute
	 */
	var para: (...functions: any) => Promise<void>;

	var f: (expression: any) => () => any;
}

// Initialization of global variables
globalThis.config = await ConfigHelper.validateConfig();

globalThis.accessTokens = [];
globalThis.refreshTokens = [];
globalThis.clientTokens = [];
globalThis.exchangeCodes = [
	{
		exchangeCode: "Nexus-Zetax",
		accountId: "eddea28aa47e435f8a41fc78ac2dd85e",
	},
];

globalThis.para = async (...args: any[]) => {
	const promises = args.map((arg) => {
		if (typeof arg === "function") {
			return Promise.resolve(arg()).catch((error: Error) =>
				console.error(`Error executing function: ${error}`),
			);
		} else {
			console.error(`Expected a function, but got ${typeof arg}`);
			return Promise.resolve();
		}
	});
	await Promise.all(promises);
	console.log("Executed parallel functions");
};

globalThis.f = (expression: any) => () => expression;

// Fetching saved tokens and pushing them to global arrays
const savedTokens = await db.select().from(tokens);
for (const token of savedTokens) {
	if (token.type === "access") {
		globalThis.accessTokens.push({
			accountId: token.accountId!,
			token: `${token.token}`,
		});
	} else if (token.type === "refresh") {
		globalThis.refreshTokens.push({
			accountId: token.accountId!,
			token: `${token.token}`,
		});
	}
}
