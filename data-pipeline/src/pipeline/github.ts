import { existsSync, readFile, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import listRepos, { GithubRepo } from "../github/repos";
import listSSOIdentities, { GithubSsoIdentity } from "../github/ssoIdentities";
import listTeams, { GithubTeam } from "../github/teams";
import listUsers, { GithubUser } from "../github/users";
import { log } from "../util/helper";

export type GithubData = {
    teams: GithubTeam[],
    users: GithubUser[],
    ssoIdentities: GithubSsoIdentity[],
    repos: GithubRepo[],
}

export type FetchGithubDataOpts = {
    verbose: boolean,
    ghToken: string,

    // config.js values
    ghOrg: string,
}

export default fetchGithubData

async function fetchGithubData ({
    verbose,
    ghToken,
    ghOrg,
}: FetchGithubDataOpts): Promise<GithubData> {
    log(verbose, 'Fetching teams from Github')
    const teams = await listTeams(ghOrg, ghToken, (recordsFound) => log(verbose, `    Found #${recordsFound} teams`))
    log(verbose, `Done with #${teams.length} teams`)

    log(verbose, 'Fetching users from Github')
    const users = await listUsers(ghOrg, ghToken, (recordsFound) => log(verbose, `    Found #${recordsFound} users`))
    log(verbose, `Done with #${users.length} users`)

    log(verbose, 'Fetching SSO identities from Github')
    const ssoIdentities = await listSSOIdentities(ghOrg, ghToken, (recordsFound) => log(verbose, `    Found #${recordsFound} SSO identities`))
    log(verbose, `Done with #${ssoIdentities.length} SSO identities`)

    log(verbose, 'Fetching repos from Github')
    const repos = await listRepos(ghOrg, ghToken, (recordsFound) => log(verbose, `    Found #${recordsFound} repos`))
    log(verbose, `Done with #${repos.length} repositories`)

    return { teams, users, ssoIdentities, repos } as GithubData
}

// Writes the github data to file (aka the data branch)
export function writeGithubDataToCache (dataDir: string, githubData: GithubData) {
    const { repos, ssoIdentities, teams, users } = githubData
    writeFileSync(join(dataDir, 'github-repos.json'), JSON.stringify(repos, null, 2), { encoding: 'utf-8' })
    writeFileSync(join(dataDir, 'github-ssoIdentities.json'), JSON.stringify(ssoIdentities, null, 2), { encoding: 'utf-8' })
    writeFileSync(join(dataDir, 'github-teams.json'), JSON.stringify(teams, null, 2), { encoding: 'utf-8' })
    writeFileSync(join(dataDir, 'github-users.json'), JSON.stringify(users, null, 2), { encoding: 'utf-8' })    
}

// Loads the github data from file (aka the data branch)
export function loadGithubDataFromCache (dataDir: string): GithubData {    
    const repos = loadIfExists(join(dataDir, 'github-repos.json'))
    const ssoIdentities = loadIfExists(join(dataDir, 'github-ssoIdentities.json'))
    const teams = loadIfExists(join(dataDir, 'github-teams.json'))
    const users = loadIfExists(join(dataDir, 'github-users.json'))

    return { repos, ssoIdentities, teams, users } as GithubData
}

const loadIfExists = <T>(filePath: string): T  => {
    if (!existsSync(filePath)) {
        throw new Error('File not found: ' + filePath)
    }
    
    const rawData = readFileSync(filePath, { encoding: 'utf-8' })
    let parsedData: T
    try {
        parsedData = JSON.parse(rawData) as T
    } catch (error) {
        throw new Error('Cannot parse ' + filePath + ': ' + error.toString())
    }

    return parsedData
}