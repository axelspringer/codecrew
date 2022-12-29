import { writeFileSync } from "fs"
import { cleanupSkllsProfiles } from "../processing/cleanupSkllsProfiles"
import { UIUser, UIUsers } from "../processing/generateUIUser"
import { SkllsProfiles } from "../processing/loadSkllsProfiles"
import { SkllsProfile } from "../sklls-cli/profile"
import run from "./run"

export const createTextFile = async (filePath: string, contents: string) => {
    writeFileSync(filePath, contents, { encoding: 'utf-8' })
}

export const installSkllsCli = async (verbose: boolean, skllsCliPath: string) => {
    return run(['cp', skllsCliPath, `/usr/local/bin/`], logProvider(verbose))
}

export const log = (verbose: boolean, ...args: string[]) => {
    if (verbose) {
        console.log(...args)
    }
}

export const logProvider = (verbose: boolean) => (...args: string[]) => {
    if (verbose) {
        console.log(...args)
    }
}

export const convertDateStrToIso = (goOrParsableDateStr: string): string => new Date(goOrParsableDateStr).toISOString()

export const convertGoDateStrs = (skllsProfile: SkllsProfile): SkllsProfile => {
    const convertedProfile = {
        ...skllsProfile,
        Dep: {},
        Ext: {},
    } as SkllsProfile

    const Dep = skllsProfile.Dep || {}
    const Ext = skllsProfile.Ext || {}

    // Go throughs Deps
    Object.entries(Dep).forEach(([parserName, deps]) => {
        Object.entries(deps).forEach(([depName, dateStrLineCounts]) => {
            Object.entries(dateStrLineCounts).forEach(([dateStr, lineCount]) => {
                // Check that parser exists
                if (!convertedProfile.Dep[parserName]) {
                    convertedProfile.Dep[parserName] = {}
                }

                // Check that dependency exists
                if (!convertedProfile.Dep[parserName][depName]) {
                    convertedProfile.Dep[parserName][depName] = {}
                }

                const convertedDateStr = convertDateStrToIso(dateStr)
                convertedProfile.Dep[parserName][depName][convertedDateStr] = lineCount
            })
        })
    })

    // Go through extensions
    Object.entries(Ext).forEach(([extName, dateStrLineCounts]) => {
        Object.entries(dateStrLineCounts).forEach(([dateStr, lineCount]) => {
            // Check if ext already exists
            if (!convertedProfile.Ext[extName]) {
                convertedProfile.Ext[extName] = {}
            }

            const convertedDateStr = convertDateStrToIso(dateStr)
            convertedProfile.Ext[extName][convertedDateStr] = lineCount
        })
    })

    return convertedProfile
}

const BEGINNING_OF_TIME = new Date(0)

export const getLastCommitDate = (skllsProfile: SkllsProfile): string => {
    let lastCommitDate = BEGINNING_OF_TIME

    const Dep = skllsProfile.Dep || {}
    const Ext = skllsProfile.Ext || {}

    // Go through dependencies
    Object.entries(Dep).forEach(([parserName, deps]) => {
        Object.entries(deps).forEach(([depName, dateStrLineCounts]) => {
            Object.entries(dateStrLineCounts).forEach(([dateStr, lineCount]) => {
                const commitDate = new Date(dateStr)
                if (commitDate > lastCommitDate) {
                    lastCommitDate = commitDate
                }
            })
        })
    })

    // Go through extensions
    Object.entries(Ext).forEach(([extName, dateStrLineCounts]) => {
        Object.entries(dateStrLineCounts).forEach(([dateStr, lineCount]) => {
            const commitDate = new Date(dateStr)
            if (commitDate > lastCommitDate) {
                lastCommitDate = commitDate
            }
        })
    })
    
    if (lastCommitDate === BEGINNING_OF_TIME) {
        return ''
    }

    return lastCommitDate.toISOString()
}

type SkllsProfileExtension = {
    LastCommit: string,
}

export type SkllsProfileExt = SkllsProfile & SkllsProfileExtension

// Returns combined profiles with ISO date strings & LastCommit date set
export const combineSkllsProfiles = (...skllsProfiles: SkllsProfile[]): SkllsProfile => {
    const combinedProfile = {
        Usernames: [],
        Dep: {},
        Ext: {},
        LastCommit: '',
    } as SkllsProfile

    skllsProfiles.forEach((skllsProfile) => {
        const Usernames = skllsProfile.Usernames || []
        const Dep = skllsProfile.Dep || {}
        const Ext = skllsProfile.Ext || {}

        // Add usernames to combined profile
        Usernames.forEach(userName => {
            if (!combinedProfile.Usernames.includes(userName)) {
                combinedProfile.Usernames.push(userName)
            }
        })

        // Add dependencies to combined profile
        Object.entries(Dep).forEach(([parserName, deps]) => {
            Object.entries(deps).forEach(([depName, dateStrLineCounts]) => {
                Object.entries(dateStrLineCounts).forEach(([rawDateStr, lineCount]) => {
                    const dateStr = convertDateStrToIso(rawDateStr)
                    // Check that parser exists
                    if (!combinedProfile.Dep[parserName]) {
                        combinedProfile.Dep[parserName] = {}
                    }

                    // Check that dependency exists
                    if (!combinedProfile.Dep[parserName][depName]) {
                        combinedProfile.Dep[parserName][depName] = {}
                    }

                    // Check if dateStr entry already exists
                    if (!combinedProfile.Dep[parserName][depName][dateStr]) {
                        combinedProfile.Dep[parserName][depName][dateStr] = lineCount
                    } else {
                        combinedProfile.Dep[parserName][depName][dateStr] += lineCount
                    }
                })
            })
        })

        // Add extensions to combined profile
        Object.entries(Ext).forEach(([extName, dateStrLineCounts]) => {
            Object.entries(dateStrLineCounts).forEach(([rawDateStr, lineCount]) => {
                const dateStr = convertDateStrToIso(rawDateStr)

                // Check if ext already exists
                if (!combinedProfile.Ext[extName]) {
                    combinedProfile.Ext[extName] = {}
                }

                // Check if dateStr entry already exists
                if (!combinedProfile.Ext[extName][dateStr]) {
                    combinedProfile.Ext[extName][dateStr] = lineCount
                } else {
                    combinedProfile.Ext[extName][dateStr] += lineCount
                }
            })
        })
    })

    const LastCommit = getLastCommitDate(combinedProfile)
    combinedProfile.LastCommit = LastCommit

    return combinedProfile
}

export type AggregatedSkllsProfile = {
    Usernames: string[],
    Dep: {
        [parserName: string]: {
            [depName: string]: number,
        }
    },
    Ext: {
        [extName: string]: number,
    },
    LastCommit: string,
}

export const aggregateLineCounts = (skllsProfile: SkllsProfile, minLoc = 500): AggregatedSkllsProfile => {
    const processedProfile = {
        ...skllsProfile,
        Dep: {},
        Ext: {},
    } as AggregatedSkllsProfile

    const deps = skllsProfile.Dep || {}
    const exts = skllsProfile.Ext || {}

    /**
     * Go through the provided profile and filter out any extensions / dependencies with
     * fewer than minLoc lines of code attached to it.
     */

    // Filter & round dependencies
    Object.entries(deps).forEach(([parserName, deps]) => {
        Object.entries(deps).forEach(([depName, lineCounts]) => {
            const lineCount = mergeLineCounts(lineCounts)
            const roundedLineCount = roundLoc(lineCount, minLoc)
            if (roundedLineCount === 0) {
                return
            }

            if (!processedProfile.Dep[parserName]) {
                processedProfile.Dep[parserName] = {}
            }
            
            processedProfile.Dep[parserName][depName] = roundedLineCount
        })
    })

    // Add extensions to combined profile
    Object.entries(exts).forEach(([extName, lineCounts]) => {
        const lineCount = mergeLineCounts(lineCounts)
        const roundedLineCount = roundLoc(lineCount, minLoc)
        if (roundedLineCount === 0) {
            return
        }
        
        processedProfile.Ext[extName] = roundedLineCount
    })

    return processedProfile
}

export const mergeAggregatedSkllsProfiles = (aggSkllsProfiles: AggregatedSkllsProfile[]): AggregatedSkllsProfile => {
    const processedProfile = {
        Dep: {},
        Ext: {},
    } as AggregatedSkllsProfile

    aggSkllsProfiles.forEach(aggregatedSkllsProfile => {
        const deps = aggregatedSkllsProfile.Dep || {} 
        const exts = aggregatedSkllsProfile.Ext || {}

        // Go through dependencies
        Object.entries(deps).forEach(([parserName, deps]) => {
            Object.entries(deps).forEach(([depName, lineCount]) => {
                if (!processedProfile.Dep[parserName]) {
                    processedProfile.Dep[parserName] = {}
                }

                if (!processedProfile.Dep[parserName][depName]) {
                    processedProfile.Dep[parserName][depName] = 0
                }
                
                processedProfile.Dep[parserName][depName] += lineCount
            })
        })

        // Add extensions to combined profile
        Object.entries(exts).forEach(([extName, lineCount]) => {
            if (!processedProfile.Ext[extName]) {
                processedProfile.Ext[extName] = 0
            }
            processedProfile.Ext[extName] += lineCount
        })
    })

    return processedProfile
}

export const mergeLineCounts = (dateStrObj: { [dateStr: string]: number }): number => {
    let count = 0
    Object.entries(dateStrObj).forEach(([_, lineCount]) => count += lineCount)
    return count
}

export const roundLoc = (loc: number, roundTo = 1000): number => loc - (loc % roundTo)

const second = 1000
const minute = 60 * second
const hour = 60 * minute
const day = 24 * hour

export const duration = { second, minute, hour, day }

export const timeBetweenMs = (dateA: Date | string, dateB: Date | string): number => {
    const a = new Date(dateA)
    const b = new Date(dateB)
    return Math.abs(a.getTime() - b.getTime())
}

export const locToString = (loc: number): string => {
    if (loc >= 10000) { return '>10k lines of code' }
    if (loc >= 5000 ) { return '5k lines of code' }
    if (loc >= 4000 ) { return '4k lines of code' }
    if (loc >= 3000 ) { return '3k lines of code' }
    if (loc >= 2000 ) { return '2000 lines of code' }
    if (loc >= 1000 ) { return '1000 lines of code' }
    if (loc >= 500 ) { return '500 lines of code' }
    
    return `${loc} lines of code`
}

export const addSynonymousEmails = (sourceEmails: string[], synonymousEmailDomains: string[]): string[] => {
    const mappedEmails = []
    const sourceEmailsLowercased = sourceEmails.map(email => email.toLowerCase())
    const synonymousEmailDomainsLowerecased = synonymousEmailDomains.map(email => email.toLowerCase())

    sourceEmailsLowercased.forEach(sourceEmail => {
        const [address, domain] = sourceEmail.split('@')
        if (!address || !domain) {
            return
        }

        if (synonymousEmailDomainsLowerecased.includes(domain)) {
            // Add the synonymous domains
            synonymousEmailDomainsLowerecased.forEach(sDomain => {
                const synonymousEmail = `${address}@${sDomain}`
                if (!mappedEmails.includes(synonymousEmail)) {
                    mappedEmails.push(synonymousEmail)
                }
            })
        } else {
            // Add the regular email
            mappedEmails.push(sourceEmail)
        }
    })

    return mappedEmails
}

export function removeExcludedExt (uiUsers: UIUsers, excludeExt: string[]): UIUsers {
    const cleanedUpProfiles = {} as UIUsers

    Object.entries(uiUsers).forEach(([userName, skllsProfile]) => {
        const cleanedUpProfile = {
            ...skllsProfile,
            Ext: {},
        } as UIUser
    
        const exts = skllsProfile.Ext || {}
        // Remove file extensions that are on the exclude list
        Object.entries(exts).forEach(([extName, lineCount]) => {
            if (!excludeExt.includes(extName.toLocaleLowerCase())) {
                cleanedUpProfile.Ext[extName] = lineCount
            }
        })

        cleanedUpProfiles[userName] = {...cleanedUpProfile}
    })

    return cleanedUpProfiles
}

export const isOlderThan = (dateStr: string, olderThan: number) => new Date(dateStr) < new Date(Date.now() - olderThan)

export const MILLISECONDS = 1
export const SECONDS = 1000 * MILLISECONDS
export const MINUTES = 60 * SECONDS
export const HOURS = 60 * MINUTES
export const DAYS = 24 * HOURS

export function removeOldProfiles (uiUsers: UIUsers, inactiveProfileCutoffDays: number): UIUsers {
    const cleanedUpProfiles = {} as UIUsers

    Object.entries(uiUsers).forEach(([email, skllsProfile]) => {
        const { LastCommit } = skllsProfile
        if (!isOlderThan(LastCommit, inactiveProfileCutoffDays * DAYS)) {
            cleanedUpProfiles[email] = {...skllsProfile}
        }
    })
    
    return cleanedUpProfiles
}

export const combineArrays = (...arrs: string[][]): string[] => {
    const res = []
    arrs
        .forEach(arr => arr
                            .filter(arr => !!arr)
                            .forEach(item => res.includes(item) || !item ? null : res.push(item))
        )
    return res
}