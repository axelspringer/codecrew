import { GithubTeam } from "../github/teams";
import { AggregatedSkllsProfile, mergeAggregatedSkllsProfiles } from "../util/helper";
import { UIUsers } from "./generateUIUser";

export type UITeam = AggregatedSkllsProfile & GithubTeam

export default generateUITeams

function generateUITeams (uiUsers: UIUsers, teams: GithubTeam[]): UITeam[] {
    const uiTeams = teams.map(team => {
        const { members, ...teamData } = team
        
        // Add Ext / Deps from UIUsers where applicable (keep in mind UIUsers is already filtered)
        const memberSklls = members
                                .map(({ ghUserName }) => uiUsers[ghUserName])
                                .filter(member => !!member)
                                .map(({ Dep, Ext }) => ({ Dep, Ext })) as AggregatedSkllsProfile[]

        const memberSkllsMerged = mergeAggregatedSkllsProfiles(memberSklls)

        // Filter out email addresses (which are inaccurate) - instead the UI should rely on users.json
        const membersWithoutEmail = members.map(({ ghUserName, avatarUrl }) => ({ ghUserName, avatarUrl }))

        // Return the aggregated team data
        return {
            ...teamData,
            ...memberSkllsMerged,
            members: membersWithoutEmail,
        } as UITeam
    })

    return uiTeams
}