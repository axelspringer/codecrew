import { describe, test, expect } from '@jest/globals'
import { SkllsProfilesExt } from '../processing/cleanupSkllsProfiles'
import { SkllsProfile } from '../sklls-cli/profile'
import { combineSkllsProfiles, duration, aggregateLineCounts, mergeLineCounts, roundLoc, timeBetweenMs, addSynonymousEmails, getLastCommitDate, convertDateStrToIso, convertGoDateStrs, removeExcludedExt, isOlderThan, DAYS, removeOldProfiles, mergeAggregatedSkllsProfiles, AggregatedSkllsProfile, combineArrays } from './helper'

test('combineSkllsProfile works as expected', () => {
    const a = {
        Usernames: ['a'],
        Dep: {
            npm: {
                "some-dep@16.13.1": {
                    "Fri, 29 Apr 2022 09:38:50 +0200": 1,
                }
            }
        },
        Ext: {
            ".json": {
                "Thu, 28 Apr 2022 16:39:53 +0200": 1,
            }
        },
    }

    const b = {
        Usernames: ['b', 'c'],
        Dep: {
            npm: {
                "some-dep@16.13.1": {
                    "Fri, 29 Apr 2022 09:38:50 +0200": 2,
                }
            }
        },
        Ext: {
            ".json": {
                "Thu, 28 Apr 2022 16:39:53 +0200": 2,
            }
        },
        LastCommit: '29 Apr 2022 09:38:50 +0200',
    }

    const c = {
        Usernames: ['c', 'a',],
        Dep: {
            npm: {
                "some-dep@16.13.1": {
                    "Fri, 29 Apr 2022 09:38:50 +0200": 3,
                }
            }
        },
        Ext: {
            ".json": {
                "Thu, 28 Apr 2022 16:39:53 +0200": 3,
            }
        },
    }

    expect(combineSkllsProfiles(a, b, c)).toStrictEqual({
        Usernames: ['a', 'b', 'c'],
        Dep: {
            npm: {
                "some-dep@16.13.1": {
                    "2022-04-29T07:38:50.000Z": 6,
                }
            }
        },
        Ext: {
            ".json": {
                "2022-04-28T14:39:53.000Z": 6,
            }
        },
        LastCommit: '2022-04-29T07:38:50.000Z',
    })
})

test('combineSkllsProfile can deal with null values for Usernames, Dep and Ext', () => {
    const a = {
        Usernames: null,
        Dep: null,
        Ext: {
            ".json": {
                "Thu, 28 Apr 2022 16:39:53 +0200": 1,
            }
        },
    }

    const b = {
        Usernames: ['b', 'c'],
        Dep: {
            npm: {
                "some-dep@16.13.1": {
                    "Fri, 29 Apr 2022 09:38:50 +0200": 2,
                }
            }
        },
        Ext: null
    }

    expect(combineSkllsProfiles(a, b)).toStrictEqual({
        Usernames: ['b', 'c'],
        Dep: {
            npm: {
                "some-dep@16.13.1": {
                    "2022-04-29T07:38:50.000Z": 2,
                }
            }
        },
        Ext: {
            ".json": {
                "2022-04-28T14:39:53.000Z": 1,
            }
        },
        LastCommit: '2022-04-29T07:38:50.000Z',
    })
})

test('convertDateStrToIso correctly converts the date str', () => {
    expect(convertDateStrToIso('Fri, 29 Apr 2022 09:38:49 +0200')).toBe('2022-04-29T07:38:49.000Z')
})

test('convertGoDateStrs converts go-date strings to ISO date strings', () => {
    const a = {
        Usernames: ['b', 'c'],
        Dep: {
            npm: {
                "some-dep@16.13.1": {
                    "Fri, 29 Apr 2022 09:38:50 +0200": 2,
                }
            }
        },
        Ext: {
            ".json": {
                "Thu, 28 Apr 2022 16:39:53 +0200": 1,
            }
        },
    }

    expect(convertGoDateStrs(a)).toStrictEqual({
        Usernames: ['b', 'c'],
        Dep: {
            npm: {
                "some-dep@16.13.1": {
                    "2022-04-29T07:38:50.000Z": 2,
                }
            }
        },
        Ext: {
            ".json": {
                "2022-04-28T14:39:53.000Z": 1,
            }
        },
    })
})

test('getLastCommitDate returns the latest commit date from a sklls-profile (as ISO date str)', () => {
    const a = {
        Usernames: [],
        Dep: {
            npm: {
                "some-dep@16.13.1": {
                    "Fri, 29 Apr 2022 09:38:50 +0200": 2,
                    "Fri, 29 Apr 2022 09:38:49 +0200": 3,
                }
            }
        },
        Ext: {
            ".json": {
                "Thu, 28 Apr 2022 16:39:53 +0200": 1,
            }
        },
    } as SkllsProfile

    expect(getLastCommitDate(a)).toEqual('2022-04-29T07:38:50.000Z')
})

test('aggregateLineCounts creates an aggregated sklls profile and only includes aggregated line counts > minLoc', () => {
    const mockProfile = {
        someOtherAttribute: 'value',
        Usernames: ['a', 'b', 'c'],
        Dep: {
            npm: {
                "some-dep@16.13.1": {
                    "Fri, 28 Apr 2022 09:38:50 +0200": 250,
                    "Fri, 29 Apr 2022 09:38:50 +0200": 250,
                    "Fri, 30 Apr 2022 09:38:50 +0200": 250,
                }
            }
        },
        Ext: {
            ".json": {
                "Thu, 28 Apr 2022 16:39:53 +0200": 250,
            }
        },
    }

    expect(aggregateLineCounts(mockProfile, 500)).toStrictEqual({
        someOtherAttribute: 'value',
        Usernames: ['a', 'b', 'c'],
        Dep: {
            npm: {
                "some-dep@16.13.1": 500
            }
        },
        Ext: {},
    })
})

test('mergeLineCounts works as expected', () => {
    const lineCounts = {
        "Thu, 28 Apr 2022 16:39:53 +0200": 1,
        "Thu, 29 Apr 2022 16:39:53 +0200": 2,
        "Thu, 30 Apr 2022 16:39:53 +0200": 3,
    }

    expect(mergeLineCounts(lineCounts)).toBe(6)
})

test('roundLoc works as expected', () => {
    expect(roundLoc(500)).toBe(0)
    expect(roundLoc(1000)).toBe(1000)

    expect(roundLoc(1750)).toBe(1000)
    expect(roundLoc(1750, 500)).toBe(1500)
    expect(roundLoc(1750, 250)).toBe(1750)
})

test('timeBetweenMs correctly returns the distance between two dates in Ms', () => {
    const dateA = '2022-10-13T09:13:16.642Z'
    const dateB = '2022-10-14T09:13:16.642Z'
    expect(timeBetweenMs(dateA, dateB)).toBe(1*duration.day)
    expect(timeBetweenMs(dateB, dateA)).toBe(24*duration.hour)
})

describe('addSynonymousEmails', () => {
    test('Returns sourceEmails if no email with synonymousEmailDomain was found', () => {
        const sourceEmails = ['jonas@email.com']
        const synonymousEmailDomains = ['a.com', 'b.de']
        expect(addSynonymousEmails(sourceEmails, synonymousEmailDomains)).toStrictEqual(sourceEmails)
    })

    test('Adds synonymous emails when email with with synonymousEmailDomain was found', () => {
        const sourceEmails = ['jonas@a.com']
        const synonymousEmailDomains = ['a.com', 'a.de', 'b.com']
        expect(addSynonymousEmails(sourceEmails, synonymousEmailDomains)).toStrictEqual(['jonas@a.com', 'jonas@a.de', 'jonas@b.com'])
    })

    test('Ignores case (by lowercasing everything)', () => {
        const sourceEmails = ['jonas@A.com']
        const synonymousEmailDomains = ['a.com', 'a.de', 'b.com']
        expect(addSynonymousEmails(sourceEmails, synonymousEmailDomains)).toStrictEqual(['jonas@a.com', 'jonas@a.de', 'jonas@b.com'])
    })
})

test('removeExcludedExt removes extensions that are on the excludeExt list', () => {
    const a = {
        'someone@email.com': {
            Usernames: ['b', 'c'],
            Dep: {
                npm: {
                    "some-dep@16.13.1": {
                        "2022-04-29T07:38:50.000Z": 2,
                    }
                }
            },
            Ext: {
                "": {
                    "2022-04-28T14:39:53.000Z": 1,
                },
                ".js": {
                    "2022-04-28T14:39:53.000Z": 1,
                },
                ".png": {
                    "2022-04-28T14:39:53.000Z": 1,
                },
                ".json": {
                    "2022-04-28T14:39:53.000Z": 1,
                }
            },
        }
    }

    expect(removeExcludedExt(a, ['', '.png', '.json'])).toStrictEqual({
        'someone@email.com': {
            Usernames: ['b', 'c'],
                Dep: {
                    npm: {
                        "some-dep@16.13.1": {
                            "2022-04-29T07:38:50.000Z": 2,
                        }
                    }
                },
                Ext: {
                    ".js": {
                        "2022-04-28T14:39:53.000Z": 1,
                    },
                },
        }
    })
})

test('isOlderThan works as expected', () => {
    expect(isOlderThan(new Date().toISOString(), 1*DAYS)).toBeFalsy()
    expect(isOlderThan(new Date(Date.now() - 3*DAYS).toISOString(), 1*DAYS)).toBeTruthy()
})

test('removeOldProfiles removes profiles that are older than a certain deadline', () => {
    const threeDaysAgo = new Date(Date.now() - 3*DAYS).toISOString()
    const ninetyOneDaysAgo =  new Date(Date.now() - 91*DAYS).toISOString()

    const skllsProfilesExt = {
        'someone@email.com': {
            LastCommit: threeDaysAgo
        },
        'someoneElse@email.com': {
            LastCommit: ninetyOneDaysAgo
        },
    } as unknown as SkllsProfilesExt

    expect(removeOldProfiles(skllsProfilesExt, 90)).toStrictEqual({
        'someone@email.com': {
            LastCommit: threeDaysAgo
        }
    })
})

test('mergeAggregatedSkllsProfiles correctly merges deps & exts', () => {
    const a = {
        Dep: {
            npm: {
                "dep-a@1.2.3": 1,
                "dep-b@1.2.3": 1,
            },
        },
        Ext: {
            '.ts': 1,
            '.js': 1,
        }
    } as any

    const b = {
        Dep: {
            npm: {
                "dep-b@1.2.3": 1,
                "dep-c@1.2.3": 3,
            },
        },
        Ext: {
            '.js': 1,
            '.py': 3,
        }
    } as any

    expect(mergeAggregatedSkllsProfiles([a, b])).toStrictEqual({
        Dep: {
            npm: {
                "dep-a@1.2.3": 1,
                "dep-b@1.2.3": 2,
                "dep-c@1.2.3": 3,
            },
        },
        Ext: {
            '.ts': 1,
            '.js': 2,
            '.py': 3,
        }
    })
})

test('combineArrays works as expected', () => {
    expect(combineArrays()).toStrictEqual([])
    expect(combineArrays(['a'],['a'])).toStrictEqual(['a'])
    expect(combineArrays(['a'],['a', 'b'], ['a', 'c'])).toStrictEqual(['a', 'b', 'c'])
    expect(combineArrays(['a'],['a', 'b'], [null, 'c'])).toStrictEqual(['a', 'b', 'c'])
})