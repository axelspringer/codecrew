import { SkllsProfiles } from "./loadSkllsProfiles"
import { SkllsProfile } from "../sklls-cli/profile";
import { removeExcludedExt, removeOldProfiles, SkllsProfileExt } from "../util/helper";
import { UIUser, UIUsers } from "./generateUIUser";

// Remove file extensions that are on the excludeExt list in config.js
export const cleanupSkllsProfiles = (uiUsers: UIUsers, excludeExt: string[], inactiveProfileCutoffDays: number): UIUsers => {
    let cleanProfiles = removeExcludedExt(uiUsers, excludeExt)
    cleanProfiles = removeOldProfiles(cleanProfiles, inactiveProfileCutoffDays)

    return cleanProfiles
}