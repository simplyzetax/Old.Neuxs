import { Context } from "hono";
import jwt, { JwtPayload } from "jsonwebtoken";

import { EScopes, TOAuthClient } from "../../types/oauth";
import { JwtHelper } from "../jwt/jwt.utility";

/**
 * The client ids and secrets
 */
export const authClients: TOAuthClient[] = [
    {
        id: "ec684b8c687f479fadea3cb2ad83f5c6",
        secret: "e1f31c211f28413186262d37a13fc84d",
        scopes: []
    },
    {
        id: "e0aca23dfb7348d6bad648bbe175a6e6",
        secret: "ec684b8c687f479fadea3cb2ad83f5c6",
        scopes: [
            EScopes.SERVER
        ]
    }
]

export namespace OAuthUtility {
    export function getClient(clientId: string, clientSecret?: string): TOAuthClient | undefined {
        return authClients.find((client) => client.id === clientId && (!clientSecret || client.secret === clientSecret));
    }

    /**
     * 
     * @param clientId The client ID
     * @param clientSecret The client secret
     * @returns 
     */
    export function isValidClient(clientId: string, clientSecret: string): boolean {
        return getClient(clientId, clientSecret) !== undefined;
    }


    /**
     * Checks if a client has a scope
     * @param clientId The client ID
     * @param scope The scope to check
     * @returns
     * */
    export function clientHasScope(clientId: string, scope: EScopes): boolean {
        const client = getClient(clientId);
        return client !== undefined && client.scopes.includes(scope);
    }

    /**
     * 
     * @param clientId 
     * @param clientSecret 
     * @param scope 
     * @returns 
     */
    export function validateClientAndScope(clientId: string, clientSecret: string, scope: EScopes): boolean {
        const client = getClient(clientId, clientSecret);
        return client !== undefined && client.scopes.includes(scope);
    }


    /**
     * 
     * @param c  The context (Hono ctx)
     * @returns Returns the client if the token is valid, otherwise undefined
     */
    export function getClientFromContext(c: Context): TOAuthClient | undefined {
        const auth = c.req.header("Authorization");
        if (!auth) return undefined;

        const token = auth.replace("bearer eg1~", "");
        const decodedClient = JwtHelper.isJwtPayload(jwt.decode(token) as JwtPayload);
        if (!decodedClient) return undefined;

        const client = getClient(decodedClient.clientId);
        if (!client || !clientTokens.find((clientToken) => clientToken.token === token)) return undefined;

        return client;
    }



    /**
     * 
     * @param c The context (Hono ctx)
     * @returns Returns true if the client is valid, otherwise false
     */
    export function validateClient(c: Context): boolean {
        return getClientFromContext(c) !== undefined;
    }
}