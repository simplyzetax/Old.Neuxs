import jwt from "jsonwebtoken";
import * as uuid from "uuid";

export async function createCaldera(accountId: string, generate: any, acProvider: any, notes: any, fallback: any) {
    const calderaToken = jwt.sign({
        account_id: accountId,
        generated: generate,
        calderaGuid: uuid.v4(),
        acProvider: acProvider,
        notes: notes,
        fallback: fallback,
    }, config.JWT_SECRET, {algorithm: "ES256", noTimestamp: true})

    return calderaToken;
}