import { SkllsProfileMap } from "./mergeSkllsProfiles";
import { AggregatedSkllsProfile, aggregateLineCounts } from "../util/helper";
import { GithubUserExtended, GithubUserMap } from "./joinSsoUsers";
import { writeFileSync } from "node:fs";

export type UIUser = AggregatedSkllsProfile & GithubUserExtended
export type UIUsers = { [userName: string]: UIUser }

export default generateUIUser

// Makes the sklls profiles ready for UI display
function generateUIUser (skllsProfiles: SkllsProfileMap, githubUsers: GithubUserMap, minLoc = 500): UIUsers {    
    // Create a map of aggregated sklls profiles
    const aggregatedSkllsProfile = {} as {[ghUserName: string]: AggregatedSkllsProfile}
    Object.entries(skllsProfiles).forEach(([ghUsername, skllsProfile]) => aggregatedSkllsProfile[ghUsername] = aggregateLineCounts(skllsProfile, minLoc))

    // Do a "left join" of ghUserMap --> aggregatedSkllsProfile
    let uiUsers = {} as { [userName: string]: UIUser }
    Object.entries(githubUsers).forEach(([ghUsername, ghUser]) => {
        const aggregatedUser = aggregatedSkllsProfile[ghUsername]
        if (ghUser && aggregatedUser) {
            uiUsers[ghUsername] = { ...aggregatedUser, ...ghUser }
        }
    })
    return uiUsers
}