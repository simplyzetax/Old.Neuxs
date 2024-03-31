export interface ShopEntry {
    vbucks: number;
    itemGrants: string[];
    price: number;
}

export interface CatalogEntry {
    devName: string;
    offerId: string;
    fullfillmentIds: string[];
    dailyLimit: number;
    weeklyLimit: number;
    monthlyLimit: number;
    prices: Price[];
    meta: MetaData;
    matchFilter: string;
    filterWeight: number;
    appStoreId: string[];
    requirements: Requirement[];
    offerType: string;
    giftInfo: GiftInfo;
    refundable: boolean;
    metaInfo: MetaData[];
    displayAssetPath: string;
    itemGrants: ItemGrant[];
    sortPriority: number;
    catalogGroupPriority: number;
}

export interface Price {
    currencyType: string;
    currencySubType: string;
    regularPrice: number;
    finalPrice: number;
    saleExpiration: Date;
    basePrice: number;
}

export interface MetaData {
    SectionId: string;
    TileSize: string;
}

export interface Requirement {
    requirementType: string;
    requiredId: string;
    minQuantity: number;
}

export interface GiftInfo {
    bIsEnabled: boolean;
    forcedGiftBoxTemplateId: string;
    purchaseRequirements: string[];
    giftRecordIds: string[];
}

export interface ItemGrant {
    templateId: string;
    quantity: number;
}

export interface Catalog {
    storefronts: Storefront[];
    expiration: string;
}

export interface Storefront {
    name: string;
    catalogEntries: CatalogEntry[];
}

export interface Shop {
    [key: string]: ShopEntry;
}