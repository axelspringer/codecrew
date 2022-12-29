import { platform } from "os"
import { join } from "path"
import { log } from "../util/helper"
import { checkout, clone, createEmptyDataBranch, doesBranchExist, showGitVersion } from "../util/git"
import { installSkllsCli, createTextFile } from "../util/helper"

export type InitializePipelineOpts = {
    verbose: boolean,
    ghToken: string,

    // config.js values
    cloneDir: string,
    whoAmI: string,
    dataBranch: string,
    commitAuthor: string,
    commitEmail: string,
}

export default initializePipeline

async function initializePipeline ({
    verbose,
    ghToken,
    cloneDir,
    whoAmI,
    dataBranch,
    commitAuthor,
    commitEmail,
}: InitializePipelineOpts) {
    // Print Git Version
    if (verbose) {
        await showGitVersion()
    }

    // Install sklls-CLI
    await installSkllsCli(verbose, `./src/sklls-cli/${platform()}/sklls`)

    // Clone repo (this one :))
    await clone(verbose, whoAmI, cloneDir, ghToken)

    // Find out if data branch exists
    let dataBranchExists = await doesBranchExist(dataBranch, cloneDir)
    log(verbose, dataBranchExists ? `Branch "${dataBranch}" exists` : `Branch "${dataBranch}" does not exist`)

    // Create data branch if it doesn't exist yet
    if (!dataBranchExists) {
        log(verbose, `Creating data branch "${dataBranch}"...`)
        await createEmptyDataBranch(verbose, dataBranch, cloneDir, commitAuthor, commitEmail)
        createTextFile(join(cloneDir, 'README.md'), '# Data branch for codecrew\nDo not delete this branch - this is updated regularly by the Github Action cronjob')
    } else {
        await checkout(verbose, dataBranch, cloneDir)
    }
}