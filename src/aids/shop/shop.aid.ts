import { Context } from "hono";
import destr from "destr";
import path from "node:path";

import { getVersion } from "../request/version.utility";
import { CryptoHelper } from "../crypto/crypto.utility";
import { CatalogEntry, ShopEntry, Storefront } from "../../types/shop";
import { Contentpages } from "../../types/contentpage";

export async function getContentPages(c: Context): Promise<object> {
    const memory = getVersion(c);
    const contentpages = destr<Contentpages>(await Bun.file(path.join(__dirname, "../../../", "resources", "contentpages.json")).text());
    const acceptLanguage = c.req.header("accept-language") || '';
    const Language = acceptLanguage.includes("-") && acceptLanguage !== "es-419" ? acceptLanguage.split("-")[0] : acceptLanguage;
    const modes = ["saveTheWorldUnowned", "battleRoyale", "creative", "saveTheWorld"];
    const backgrounds = contentpages.dynamicbackgrounds.backgrounds.backgrounds;

    modes.forEach(mode => {
        const message = contentpages.subgameselectdata?.[mode]?.message;
        if (message) {
            message.title = message.title[Language];
            message.body = message.body[Language];
        }
    });

    backgrounds.forEach((background: { stage: string }) => {
        return { ...background, stage: `season${memory.season}` };
    });
    
    ['_activeDate', 'loginmessage', 'survivalmessage', 'athenamessage'].forEach(field => {
        contentpages[field] = { ...contentpages[field], _activeDate: config.dates.seasonStart };
    });
    
    if (memory.build === 11.31 || memory.build === 11.40) {
        backgrounds.forEach((background: { stage: string }) => {
            return { ...background, stage: "Winter19" };
        });
    }

    if (memory.build == 19.01) {
        Object.assign(contentpages, {
            dynamicbackgrounds: {
                backgrounds: {
                    backgrounds: [{
                        stage: "winter2021",
                        backgroundimage: "https://cdn.discordapp.com/attachments/927739901540188200/930880158167085116/t-bp19-lobby-xmas-2048x1024-f85d2684b4af.png"
                    }]
                }
            },
            subgameinfo: {
                battleroyale: {
                    image: "https://cdn.discordapp.com/attachments/927739901540188200/930880421514846268/19br-wf-subgame-select-512x1024-16d8bb0f218f.jpg"
                }
            },
            specialoffervideo: {
                bSpecialOfferEnabled: "true"
            }
        });
    }

    if (memory.season == 20) {
        backgrounds[0].backgroundimage = memory.build == 20.40 ? "https://cdn2.unrealengine.com/t-bp20-40-armadillo-glowup-lobby-2048x2048-2048x2048-3b83b887cc7f.jpg" : "https://cdn2.unrealengine.com/t-bp20-lobby-2048x1024-d89eb522746c.png";
    }

    if (memory.season == 21) {
        backgrounds[0].backgroundimage = "https://cdn2.unrealengine.com/s21-lobby-background-2048x1024-2e7112b25dc3.jpg";
    }

    return contentpages;
}

export async function getShop() {
    try {
        const catalogRaw = Bun.file(path.join(__dirname, '../../../', 'resources', 'catalog.json'));
        const shopRaw = Bun.file(path.join(__dirname, '../../../', 'resources', 'shop.json'));

        const catalog = destr<any>(await catalogRaw.text());
        const shop = destr<any>(await shopRaw.text());

        const getMetaData = (entry: string) => ({
            SectionId: entry.toLowerCase().startsWith('daily') ? 'Featured' : 'Normal',
            TileSize: entry.toLowerCase().startsWith('daily') ? 'Small' : 'Normal',
        });

        const expirationDate = new Date();
        expirationDate.setHours(23, 59, 59, 999);

        const createNewEntry = (entry: string, shopEntry: ShopEntry) => {
            const isDaily = entry.toLowerCase().startsWith('daily');
            const newEntry = {
                devName: '',
                fullfillmentIds: [],
                offerId: '',
                dailyLimit: -1,
                weeklyLimit: -1,
                monthlyLimit: -1,
                prices: [{
                    currencyType: 'MtxCurrency',
                    currencySubType: '',
                    regularPrice: shopEntry.vbucks,
                    finalPrice: shopEntry.vbucks,
                    saleExpiration: expirationDate,
                    basePrice: shopEntry.vbucks,
                }],
                meta: getMetaData(entry),
                matchFilter: '',
                filterWeight: 0,
                appStoreId: [],
                requirements: [],
                offerType: 'StaticPrice',
                giftInfo: {
                    bIsEnabled: true,
                    forcedGiftBoxTemplateId: '',
                    purchaseRequirements: [],
                    giftRecordIds: [],
                },
                refundable: false,
                metaInfo: [getMetaData(entry)],
                displayAssetPath: '',
                itemGrants: [],
                sortPriority: isDaily ? -1 : 0,
                catalogGroupPriority: 0,
            };

            return { newEntry, isDaily };
        };

        for (const entry in shop) {
            const shopEntry = shop[entry];

            if (!Array.isArray(shopEntry.itemGrants) || shopEntry.itemGrants.length === 0) {
                continue;
            }

            const { newEntry, isDaily }: { newEntry: CatalogEntry, isDaily: boolean } = createNewEntry(entry, shopEntry);
            const i = catalog.storefronts.findIndex((p: Storefront) => p.name === (isDaily ? 'BRDailyStorefront' : 'BRWeeklyStorefront'));

            if (i === -1) {
                continue;
            }

            for (const itemGrant of shopEntry.itemGrants) {
                if (typeof itemGrant === 'string' && itemGrant.length > 0) {
                    newEntry.requirements.push({ requirementType: 'DenyOnItemOwnership', requiredId: itemGrant, minQuantity: 1 });
                    newEntry.itemGrants.push({ templateId: itemGrant, quantity: 1 });
                }
            }

            if (newEntry.itemGrants.length > 0) {
                const uniqueIdentifier = CryptoHelper.sha1(`${JSON.stringify(shopEntry.itemGrants)}_${shopEntry.price}`);

                newEntry.devName = uniqueIdentifier;
                newEntry.offerId = uniqueIdentifier;

                catalog.storefronts[i].catalogEntries.push(newEntry);
            }
        }

        catalog.expiration = expirationDate.toISOString();

        return catalog;
    } catch (error) {
        console.log(error);
    }
}

