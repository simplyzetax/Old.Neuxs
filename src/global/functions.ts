import * as nexusModule from '../aids/error/error.utility';

globalThis.nexus = nexusModule.nexus;

export enum typeIds {
    UID = "uid", //User
    ATID = "atid", //Athena
    CCID = "ccid", //Common core
    CPID = "cpid", //Common public
    CRID = "crid", //Creative

    ITID = "itid", //Item
    LOID = "loid", //Loadout
}