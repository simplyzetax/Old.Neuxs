import { Athena, AthenaHelper } from "../../database/wrappers/athena.wrapper";
import { CommonCore, CommonCoreHelper } from "../../database/wrappers/commoncore.wrapper";
import { User } from "../../models/db/user";
import { AthenaSchemaModelJSON } from "../../models/ts/athena";
import { IVersion } from "../request/version.utility";

export type PossibleProfiles = Athena | CommonCore;

export namespace MCPHelper {

    //TODO: Add common core as well
    export async function getProfile(user: User, profileId: string): Promise<PossibleProfiles | undefined> {
        let profile;
        switch (profileId) {
            case "athena":
                profile = await AthenaHelper.getProfile(user.accountId);
                break;
            case "common_core":
                profile = await CommonCoreHelper.getProfile(user.accountId);
                break;
            default:
                return undefined;
        }
        if (!profile) return undefined;
        return profile;
    }

    export function createResponse(profile: any, applyProfileChanges: object[]) {
        return {
            profileRevision: profile.rvn || 0,
            profileId: profile.profileId,
            profileChangesBaseRevision: profile.rvn - 1,
            profileChanges: applyProfileChanges,
            profileCommandRevision: profile.rvn,
            serverTime: new Date().toISOString(),
            responseVersion: 1,
        };
    }

    export function updateFavorite(profile: Athena, templateId: string, slot: any, applyProfileChanges: any, name: string, value: any, index?: number) {
        if (index !== undefined) {
            profile.stats.attributes[name][index] = value;
            slot.items[index] = templateId;
        } else {
            profile.stats.attributes[name] = value;
            slot.items = [templateId];
        }

        applyProfileChanges.push({
            changeType: "statModified",
            name,
            value: profile.stats.attributes[name],
        });
    };

}
