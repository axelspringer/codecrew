import { readFileSync } from 'fs'
import { basename } from 'path';
import { SkllsProfile } from "../sklls-cli/profile";
import { getLastCommitDate } from '../util/helper';
const glob = require('glob')

export type SkllsProfiles = { [email: string]: SkllsProfile }
export default loadSkllsProfiles

function loadSkllsProfiles (dataDir: string): SkllsProfiles {
    const profiles = {} as SkllsProfiles
    const filePaths = glob.sync(dataDir + '/**/*.json')
    filePaths.forEach(filePath => {
        const skllsDataRaw = readFileSync(filePath, { encoding: 'utf-8' })
        let skllsData = {} as SkllsProfile
        try {
            skllsData = JSON.parse(skllsDataRaw)
        } catch (error) {
            console.log(`Skipping ${filePath} (cannot parse contents)`)
            return
        }

        const email = basename(filePath, ".json")
        const LastCommit = getLastCommitDate(skllsData)

        profiles[email] = { ...skllsData, LastCommit }
    })
    return profiles
}