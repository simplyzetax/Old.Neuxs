import app from "../..";
import { Athena, AthenaHelper } from "../../database/wrappers/athena.wrapper";
import { getAuthUser } from "../../middleware/auth.middleware";
import { getVersion } from "../../aids/request/version.utility";
import { MCPHelper } from "../../aids/mcp/mcp.utility";

app.post("/fortnite/api/game/v2/profile/*/client/SetCosmeticLockerSlot", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.sendError(nexus.mcp.operationForbidden);

    const { profileId, rvn } = c.req.query();
    if (!profileId || !rvn) return c.sendError(nexus.mcp.invalidPayload.withMessage("Missing query profileId or rvn"));

    let body: any;
    try {
        body = await c.req.json();
    } catch {
        return c.sendError(nexus.mcp.invalidPayload.withMessage("Invalid body"));
    }

    const profile = await AthenaHelper.getProfile(user.accountId);
    if (!profile) return c.sendError(nexus.mcp.templateNotFound.withMessage(`Profile ${profileId} not found`));

    const memory = getVersion(c);
    profile.stats.attributes.season_num = memory.season;

    let applyProfileChanges = [];
    const queryRevision = rvn || -1;
    const specialCosmetics = ["AthenaCharacter:cid_random", "AthenaBackpack:bid_random", "AthenaPickaxe:pickaxe_random", "AthenaGlider:glider_random", "AthenaSkyDiveContrail:trails_random", "AthenaItemWrap:wrap_random", "AthenaMusicPack:musicpack_random", "AthenaLoadingScreen:lsid_random"];

    profile.items = profile.items || {};

    let itemToSlotID = Object.keys(profile.items).find(itemId => profile.items[itemId].templateId.toLowerCase() === body.itemToSlot.toLowerCase()) || "";

    if (!profile.items[body.lockerItem]) return c.sendError(nexus.mcp.templateNotFound.withMessage(`Locker item ${body.lockerItem} not found`));
    if (profile.items[body.lockerItem].templateId.toLowerCase() !== "cosmeticlocker:cosmeticlocker_athena") return c.sendError(nexus.mcp.invalidPayload.withMessage(`Locker item ${body.lockerItem} is not a locker`));

    if (!profile.items[itemToSlotID] && body.itemToSlot && !specialCosmetics.includes(body.itemToSlot)) {
        return c.sendError(nexus.mcp.templateNotFound.withMessage(`Item ${body.itemToSlot} not found`));
    }

    if (profile.items[itemToSlotID] && !profile.items[itemToSlotID].templateId.startsWith(`Athena${body.category}:`)) {
        return c.sendError(nexus.mcp.invalidPayload.withMessage(`Item ${body.itemToSlot} is not a ${body.category}`));
    }

    if (profile.items[itemToSlotID]) {
        const attributes = profile.items[itemToSlotID].attributes;
        if (!attributes.variants) {
            return c.sendError(nexus.mcp.invalidPayload.withMessage(`Item ${body.itemToSlot} does not have variants`));
        }
        const Variants = body.variantUpdates;
        if (Array.isArray(Variants)) {
            for (const i in Variants) {
                if (typeof Variants[i] !== "object" || !Variants[i].channel || !Variants[i].active) continue;
                const index = attributes.variants.findIndex((x: any) => x.channel === Variants[i].channel);
                if (index === -1 || !attributes.variants[index].owned.includes(Variants[i].active)) continue;
                attributes.variants[index].active = Variants[i].active;
            }
            applyProfileChanges.push({ changeType: "itemAttrChanged", itemId: itemToSlotID, attributeName: "variants", attributeValue: attributes.variants });
        }
    }

    const lockerItemAttributes = profile.items[body.lockerItem].attributes;
    const lockerSlotsData = lockerItemAttributes.locker_slots_data;
    const categorySlots = lockerSlotsData.slots[body.category];
    if (categorySlots) {
        const itemToSlot = itemToSlotID || body.itemToSlot;
        switch (body.category) {
            case "Dance":
                if (body.slotIndex >= 0 && body.slotIndex <= 5) {
                    categorySlots.items[body.slotIndex] = body.itemToSlot;
                    profile.stats.attributes.favorite_dance[body.slotIndex] = itemToSlot;
                }
                break;
            case "ItemWrap":
                if (body.slotIndex >= 0 && body.slotIndex <= 7) {
                    categorySlots.items[body.slotIndex] = body.itemToSlot;
                    profile.stats.attributes.favorite_itemwraps[body.slotIndex] = itemToSlot;
                    profile.equipFavorite("favorite_itemwrap", itemToSlot, body.slotIndex);
                } else if (body.slotIndex === -1) {
                    for (let i = 0; i < 7; i++) {
                        categorySlots.items[i] = body.itemToSlot;
                        profile.stats.attributes.favorite_itemwraps[i] = itemToSlot;
                    }
                }
                break;
            default:
                if (body.category === "Pickaxe" || body.category === "Glider") {
                    if (!body.itemToSlot) return c.sendError(nexus.mcp.invalidPayload.withMessage("Missing body parameters"));
                }
                categorySlots.items = [body.itemToSlot];
                profile.stats.attributes[`favorite_${body.category}`.toLowerCase()] = itemToSlot;
                break;
        }
        applyProfileChanges.push({ changeType: "itemAttrChanged", itemId: body.lockerItem, attributeName: "locker_slots_data", attributeValue: lockerSlotsData });
    }

    if (applyProfileChanges.length > 0) {
        profile.rvn += 1;
        profile.commandRevision += 1;
        profile.updated = new Date().toISOString();
        profile.equipFavorite(body.category.toLowerCase(), itemToSlotID || body.itemToSlot, body.slotIndex);
        para(f(profile.save()))
    }

    const profileRevisionCheck = (memory.build >= 12.20) ? profile.commandRevision : profile.rvn;
    if (queryRevision !== profileRevisionCheck) {
        applyProfileChanges = [{ changeType: "fullProfileUpdate", profile: profile }];
    }

    return c.json(MCPHelper.createResponse(profile, applyProfileChanges));
});