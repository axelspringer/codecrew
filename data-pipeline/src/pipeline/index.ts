import { writeFileSync } from "fs";
import { join } from "path";
import { commitAndPush } from "../util/git";
import { createTextFile } from "../util/helper";
import { Config } from "./config";
import pushChanges from "./finalize";
import fetchGithubData, { GithubData, loadGithubDataFromCache, writeGithubDataToCache } from "./github";
import initializePipeline from "./initialize";
import generateUiData from "./processData";
import updateSklls from "./sklls";

export default runDataPipeline

// TODO: Figure out if these should go into the config.js
const verbose = true
const cloneDir = 'codecrew-data'
// Directory where the data that will be consumed by UI is written to
const publicDataDir = `${cloneDir}/data`
// Directory where the background / processing data is written to (not really private - it's still available on the static hoster)
const privateDataDir = `${publicDataDir}/__codecrew__`

export enum PipelineMode {
    // Update sklls data fetches changed repos and updates sklls profiles (should be run 1-6x / hour)
    UpdateSkllsData = 'UpdateSkllsData',
    // Update github data fetches all users, teams and SSO identities from Github (should be run 1-6x / day)
    UpdateGithubData = 'UpdateGithubData',
    // For Development only - only run the aggregation logic (on locally existing data)
    DryRun = 'DryRun',
}

async function runDataPipeline(mode: PipelineMode, config: Config, ghToken: string, dataRepoGhToken: string) {
    console.log('Running data pipeline with config: ', JSON.stringify(config, null, 2), '\n')
    // TODO: Only pass in the needed values from config! This is where the config is being used - not just passed down.

    if (mode === PipelineMode.DryRun) {
        console.log('*** DRY-RUN *** (running data aggregation only)')
        let githubData: GithubData
        try {
            githubData = loadGithubDataFromCache(privateDataDir)
        } catch (error) {
            console.log('Could not load github data from cache (did the update Github data job run yet?): ', error.toString())
            process.exit(1)
        }
        console.log('Load Github data from cache complete ✅')

        try {
            const { teams, users, repos, ssoIdentities } = githubData
            const { minLoc, synonymousEmailDomains, excludeExt, inactiveProfileCutoffDays } = config
            await generateUiData({ verbose, minLoc, privateDataDir, publicDataDir, githubTeams: teams, githubUsers: users, githubRepos: repos, githubSsoIdentities: ssoIdentities, synonymousEmailDomains, excludeExt, inactiveProfileCutoffDays })
        } catch (error) {
            console.log('Error while trying to crunch the numbers: ', error.toString(), '\n', error.stack)
            process.exit(1)
        }
        console.log('Data aggregation complete ✅')
        return
    }
    
    try { 
        const { whoAmI, dataBranch, commitAuthor, commitEmail } = config
        await initializePipeline({ verbose, ghToken: dataRepoGhToken, cloneDir, whoAmI, dataBranch, commitAuthor, commitEmail })
    } catch (error) {
        console.log('Error while trying to initialize data pipeline: ', error.toString())
        process.exit(1)
    }
    console.log('Init complete ✅')

    let githubData: GithubData
    if (mode === PipelineMode.UpdateGithubData) {
        try {
            githubData = await updateGithubData(config, ghToken, privateDataDir)
        } catch (error) {
            console.log('Could not fetch Github data (make sure the token in use has sufficient rights): ', error.toString())
            process.exit(1)
        }
    } else if (mode === PipelineMode.UpdateSkllsData) {
        try {
            githubData = loadGithubDataFromCache(privateDataDir)
        } catch (error) {
            console.log('Could not load github data from cache (did the update Github data job run yet?): ', error.toString())
            process.exit(1)
        }
        console.log('Load Github data from cache complete ✅')

        try {
            const { repoAnalysisLimit } = config
            const { repos: currentRepos } = githubData
            await updateSklls({ verbose, ghToken, privateDataDir, currentRepos, repoAnalysisLimit })
        } catch (error) {
            console.log('Error while trying to update sklls data: ', error.toString())
            process.exit(1)
        }
        console.log('Update of sklls data complete ✅')
    }

    try {
        const { teams, users, repos, ssoIdentities } = githubData
        const { minLoc, synonymousEmailDomains, excludeExt, inactiveProfileCutoffDays } = config
        await generateUiData({ verbose, minLoc, privateDataDir, publicDataDir, githubTeams: teams, githubUsers: users, githubRepos: repos, githubSsoIdentities: ssoIdentities, synonymousEmailDomains, excludeExt, inactiveProfileCutoffDays })
    } catch (error) {
        console.log('Error while trying to crunch the numbers: ', error.toString())
        process.exit(1)
    }
    console.log('Data aggregation complete ✅')

    try {
        const { commitAuthor, commitEmail, dataBranch } = config
        await pushChanges({ verbose, cloneDir, publicDataDir, commitAuthor, commitEmail, dataBranch })
    } catch (error) {
        console.log('Error while trying to push changes back to repo: ', error.toString())
    }
    console.log('Changes pushed to repo ✅')
}

async function updateGithubData (config: Config, ghToken: string, dataDir: string): Promise<GithubData> {
    let githubData: GithubData
    try {
        const { ghOrg } = config
        githubData = await fetchGithubData({ verbose, ghToken, ghOrg })
    } catch (error) {
        console.log('Error while trying to fetch github data: ', error.toString())
        process.exit(1)
    }
    console.log('Github data fetch complete ✅')

    writeGithubDataToCache(dataDir, githubData)
    console.log('Successfully wrote Github data ✅')
    
    return githubData
}