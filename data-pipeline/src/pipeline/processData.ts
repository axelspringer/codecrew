import { join } from "path"
import { mkdirSync, writeFileSync } from 'fs'
import { GithubSsoIdentity } from "../github/ssoIdentities"
import { GithubRepo } from "../github/repos"
import { GithubTeam } from "../github/teams"
import { GithubUser } from "../github/users"
import joinSsoUsers from "../processing/joinSsoUsers"
import loadSkllsProfiles from "../processing/loadSkllsProfiles"
import getUsernameEmailMapping from "../processing/getUsernameEmailMapping"
import mergeSkllsProfiles from "../processing/mergeSkllsProfiles"
import generateUIUser from "../processing/generateUIUser"
import { cleanupSkllsProfiles } from "../processing/cleanupSkllsProfiles"
import generateUITeams from "../processing/generateUITeams"

export type GenerateUiDataOpts = {
    verbose: boolean,
    privateDataDir: string,
    publicDataDir: string,

    // config.js
    minLoc: number,
    synonymousEmailDomains: string[],
    excludeExt: string[],
    inactiveProfileCutoffDays: number,

    // Data from previous steps
    githubTeams: GithubTeam[],
    githubUsers: GithubUser[],
    githubRepos: GithubRepo[],
    githubSsoIdentities: GithubSsoIdentity[],
}

export default generateUiData

async function generateUiData ({
    verbose,
    minLoc,
    privateDataDir,
    publicDataDir,
    githubTeams: teams,
    githubUsers: githubUsers,
    githubRepos: repos,
    githubSsoIdentities: ssoIdentities,
    excludeExt = [],
    synonymousEmailDomains,
    inactiveProfileCutoffDays

}: GenerateUiDataOpts) {
    let privatePath = join(privateDataDir, 'aggregates')
    mkdirSync(privatePath, { recursive: true })

    let publicPath = publicDataDir
    mkdirSync(publicDataDir, { recursive: true })
    
    // "Left join" ssoIdentities --> Github users (only hang on to github users with an SSO Identity)
    const mergedGithubUsers = joinSsoUsers(githubUsers, ssoIdentities)
    writeFileSync(join(privatePath, `merged-github-users.json`), JSON.stringify(mergedGithubUsers, null, 2), { encoding: 'utf-8' })
    
    // Load sklls profiles
    const skllsProfiles = loadSkllsProfiles(join(privateDataDir, 'sklls-data'))
    writeFileSync(join(privatePath, `all-sklls-profiles-raw.json`), JSON.stringify(skllsProfiles, null, 2), { encoding: 'utf-8' })
    
    // Pull the usernames from the sklls-profiles and correlate them with the email addresses of profiles
    const userNameEmailsMap = getUsernameEmailMapping(mergedGithubUsers, skllsProfiles, synonymousEmailDomains)
    writeFileSync(join(privatePath, `username-email-mapping.json`), JSON.stringify(userNameEmailsMap, null, 2), { encoding: 'utf-8' })

    // Merge sklls profile by username
    const mergedSkllsProfiles = mergeSkllsProfiles(userNameEmailsMap, skllsProfiles)
    writeFileSync(join(privatePath, `merged-sklls-profiles.json`), JSON.stringify(mergedSkllsProfiles, null, 2), { encoding: 'utf-8' })

    // Generate UI users (merge skill line counts + only use the profiles with username that have an SSO identity attached to it)
    const uiUsersRaw = generateUIUser(mergedSkllsProfiles, mergedGithubUsers, minLoc)
    writeFileSync(join(privatePath, `ui-users-unpolished.json`), JSON.stringify(uiUsersRaw, null, 2), { encoding: 'utf-8' })

    // Cleanup sklls profiles (removing extensions that are on the exclude-list, removing old profiles)
    const uiUsers = cleanupSkllsProfiles(uiUsersRaw, excludeExt, inactiveProfileCutoffDays)
    writeFileSync(join(publicPath, `users.json`), JSON.stringify(uiUsers, null, 2), { encoding: 'utf-8' })

    // Generate extended team profiles (using the sklls-profiles of the teams)
    const uiTeams = generateUITeams(uiUsers, teams)
    writeFileSync(join(publicPath, `teams.json`), JSON.stringify(uiTeams, null, 2), { encoding: 'utf-8' })
}