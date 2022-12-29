import { join } from 'path'
import { readFileSync, existsSync, writeFileSync } from 'fs'
import run from '../util/run'
import { log, logProvider } from '../util/helper'
import { createTempDir } from '../util/tmpdir'
import { GithubRepo } from '../github/repos'
import getRepoDiff, { patchRepos } from '../util/repoDiff'

export type UpdateSkllsOpts = {
    verbose: boolean,
    ghToken: string,
    privateDataDir: string,

    // Data from previous steps
    currentRepos: GithubRepo[],

    // config.js values
    repoAnalysisLimit: number,
}

export default updateSklls

async function updateSklls ({
    verbose,
    ghToken,
    currentRepos,
    privateDataDir,
    repoAnalysisLimit,
}: UpdateSkllsOpts) {
    // Attempt to load existing repos file
    const reposFile = join(privateDataDir, 'repo-state.json')
    let existingRepos = []
    if (existsSync(reposFile)) {
        try {
            const existingReposJson = readFileSync(reposFile, { encoding: 'utf8' })
            existingRepos = JSON.parse(existingReposJson)
        } catch (error: any) {
            throw new Error(`Error while trying to load existing repos from ${reposFile}:\n${error.toString()}`)
        }
        log(verbose, `Successfully loaded repo state from ${reposFile}`)
    }

    let repoDiff = getRepoDiff(verbose, currentRepos, existingRepos, repoAnalysisLimit)
    const changedAndAdded = [...repoDiff.added, ...repoDiff.changed]
    const repoNamesChangedDeleted = changedAndAdded.map(({ fullName }) => fullName)

    // Create repo to clone data into
    let cloneDir = ''
    try {
        cloneDir = await createTempDir('codecrew-cloned-repos')
    } catch (error: any) {
        throw new Error(`Cannot create clone directory:\n${error.toString()}`)
    }
    log(verbose, `Cloning repos into:\n${cloneDir}`)

    // Run analysis
    const cmd = [`sklls`, `-ghrepos=${repoNamesChangedDeleted.join(',')}`, `-ghpat=${ghToken}`, `-out=${privateDataDir}/sklls-data`, `-cloneDir=${cloneDir}`]
    log(verbose, `Running command sklls-cli on the following ${changedAndAdded.length} repos:\n${repoNamesChangedDeleted}\n\n`)
    await run(cmd, logProvider(verbose))

    repoDiff.deleted.forEach(repo => {
        log(verbose, '  TODO: Delete ', repo.fullName)
    })

    // Write new repo state
    const combinedRepos = patchRepos(existingRepos, repoDiff)
    writeFileSync(reposFile, JSON.stringify(combinedRepos, null, 2), { encoding: 'utf-8' })
}