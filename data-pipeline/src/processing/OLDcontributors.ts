import * as fs from 'fs'
import * as path from 'path'
import { mapReducer, PushToChannelFn } from "./OLDmapreduce"

const glob = require('glob')

const MIN_LINE_COUNT = 200
const CONVERT_TO_PERCENTAGES = true

// Implementation
type ParsedContributor = {
    Usernames: string[],
    Ext: {
        [extName: string]: {
            [dateStr: string]: number,
        }
    },
    Dep: {
        [parserName: string]: {
            [dep: string]: {
                [dateStr: string]: number,
            }
        }
    }
}

export async function aggregateLineCounts(basePath: string, files: string[], contributorFileName = "contributors.json") {
    const jobs = files

    const map = async (job: any, pushToReducer: PushToChannelFn) => {
        const rawFileContents = fs.readFileSync(job, { encoding: 'utf-8' })
        let contributor: ParsedContributor
        try {
            contributor = JSON.parse(rawFileContents)
        } catch (error) {
            console.log(`Cannot parse ${job}: ${error}`)
            return
        }

        const contributorEmail = path.basename(job).replace(/\.json$/, '')

        Object.entries(contributor.Ext || []).forEach(([extName, lineCounts]) => {
            Object.entries(lineCounts).forEach(async ([dateStr, lineCount]) => {
                if (extName.trim() === "" || lineCount < MIN_LINE_COUNT) {
                    return
                }
                await pushToReducer(contributorEmail, { type: 'ext', extName, lineCount })
            })
        })

        Object.entries(contributor.Dep || []).forEach(([parserName, deps]) => {
            Object.entries(deps || []).forEach(([dep, lineCounts]) => {
                Object.entries(lineCounts).forEach(async ([dateStr, lineCount]) => {
                    if (dep.trim() === "" || lineCount < MIN_LINE_COUNT) {
                        return
                    }
                    await pushToReducer(contributorEmail, { type: 'dep', parserName, dep, lineCount })
                })
            })
        })
    }

    const reduce = async (channelName: string, values: any[], pushToResults: PushToChannelFn) => {
        const email = channelName
        const ghUsername = ghUsernameFromEmail(email)
        const exts: { [ext: string]: number } = {}
        const deps: { [parserName: string]: { [dep: string]: number } } = {}
        let extsLineCount = 0
        let depsLineCount = 0

        // Aggregate
        values.forEach(({ type, extName, parserName, dep, lineCount }) => {
            if (type === 'ext') {
                if (!exts[extName]) {
                    exts[extName] = 0
                }
                exts[extName] += lineCount
                extsLineCount += lineCount
            }

            if (type === 'dep') {
                if (!deps[parserName]) {
                    deps[parserName] = {}
                }
                if (!deps[parserName][dep]) {
                    deps[parserName][dep] = 0
                }
                deps[parserName][dep] += lineCount
                depsLineCount += lineCount
            }
        })


        // Convert to percentages
        if (CONVERT_TO_PERCENTAGES) {
            Object.entries(exts).forEach(([ext, lineCount]) => {
                const factor = lineCount / extsLineCount
                exts[ext] = parseFloat(factor.toFixed(4))
            })
            Object.entries(deps).forEach(([parserName, dependencies]) => {
                Object.entries(dependencies).forEach(([dep, lineCount]) => {
                    const factor = lineCount / depsLineCount
                    deps[parserName][dep] = parseFloat(factor.toFixed(4))
                })
            })
        }

        await pushToResults(email, { email, ghUsername, exts, deps })
    }

    const aggregatedContributorData = await mapReducer(jobs, map, reduce)
    return aggregatedContributorData
    // fs.writeFileSync(path.join(basePath, contributorFileName), JSON.stringify(aggregatedContributorData, null, 2), { encoding: 'utf-8' })
    // console.log('Done')
}

function ghUsernameFromEmail(email: string): string {
    const pattern = /\d*\+?(?<ghUsername>.*)@users.noreply.github.com/;
    const match = email.match(pattern);
    return match && match.groups && match.groups.ghUsername || ''
}

// Different contraints for this map reduce job
async function howToUseThis() {
    const basePath = __dirname + "/" + "fixtures"

    // Example #1 - Trigger job for all JSON files
    const allJsonFiles = glob.sync(basePath + '/**/*.json')

    // Example #2 = Trigger job for some users
    const jsonFilesSpecificUsers = [
        ...glob.sync(basePath + '/**/' + '36203457+jpeeck-spring@users.noreply.github.com' + '.json'),
        ...glob.sync(basePath + '/**/' + 'hi@aguynamedjonas.com' + '.json'),
        ...glob.sync(basePath + '/**/' + 'jonas.peeck@spring-media.de' + '.json'),
    ]

    await aggregateLineCounts(basePath, allJsonFiles)
}

// Uncomment to run it with npx ts-node contributors.ts
// howToUseThis()