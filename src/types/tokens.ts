export type accessToken = {
    accountId: string;
    token: string;
}

export type refreshToken = {
    accountId: string;
    token: string;
}

export type clientToken = {
    ip: string;
    token: string;
}

export type exchangeCode = {
    exchangeCode: string;
    accountId: string;
}