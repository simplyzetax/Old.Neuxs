export interface ILocker {
    id: string;
    profileId: string;
    templateId: string;
    lockerName: string;
    bannerId: string;
    bannerColorId: string;
    characterId: string;
    backpackId: string;
    gliderId: string;
    danceId: unknown;
    pickaxeId: string;
    itemWrapId: unknown;
    contrailId: string;
    loadingScreenId: string;
    musicPackId: string;
    [key: string]: unknown; // This line allows for any string key
}