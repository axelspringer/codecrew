import { join } from "path"
import { commitAndPush } from "../util/git"
import { createTextFile } from "../util/helper"
import { Config } from "./config"

export type PushChangesOpts = {
    verbose: boolean,
    cloneDir: string,
    publicDataDir: string,

    // config.js values
    commitAuthor: string,
    commitEmail: string,
    dataBranch: string,
}

export default pushChanges

async function pushChanges ({ verbose, cloneDir, publicDataDir, commitAuthor, commitEmail, dataBranch }: PushChangesOpts) {
    createTextFile(join(publicDataDir, 'last-update.txt'), new Date().toISOString())
    await commitAndPush(verbose, "Update data", commitAuthor, commitEmail, dataBranch, cloneDir)
}