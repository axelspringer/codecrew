import { writeFileSync } from "fs";
import { basename } from "path";
import { SkllsProfile } from "../sklls-cli/profile";
import { combineSkllsProfiles } from "../util/helper";
import { UsernameEmailMap } from "./getUsernameEmailMapping";
import { SkllsProfiles } from "./loadSkllsProfiles";
import mapReducer, { MapperFn, ReducerFn, ResultFormat } from "./mapReducer";

export type SkllsProfileMap = { [userName: string]: SkllsProfile }
export default mergeSkllsProfiles

function mergeSkllsProfiles (userEmailMap: UsernameEmailMap, skllsProfiles: SkllsProfiles): SkllsProfileMap {
    const userSkllsMap = Object.entries(userEmailMap).map(
        ([userName, emails]) => [userName, emails.map(
            email => skllsProfiles[email.toLowerCase()]  // Crucial! All emails are lower-cased in the sklls-data!
        )] as [string, SkllsProfile[]]
    )

    const combinedProfiles = mapReducer(userSkllsMap, mapper, reducer, ResultFormat.OBJECT)
    return combinedProfiles as { [userName: string]: SkllsProfile }
}

const mapper: MapperFn<[string, SkllsProfile[]], SkllsProfile> = ([userName, profiles], pushToReducer) => {
    profiles.forEach(profile => {
        if (!!profile) {
            pushToReducer(userName, profile)
        }
    })
}

const reducer: ReducerFn<SkllsProfile, SkllsProfile> = (userName, skllsProfiles, pushToResults) => {
    const combinedProfile = combineSkllsProfiles(...skllsProfiles)
    pushToResults(userName, combinedProfile)
}