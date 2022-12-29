import { describe, test, expect } from '@jest/globals'
import { Repo } from '../github/repos'
import { diffRepos, patchRepos, RepoDiff } from "./repoDiff"

describe('ListChangedRepos', () => {
    describe('diffRepos', () => {
        test('Returns repo as added if it exists in b but not in a', () => {
            const repo = { fullName: 'org/repo1' }
            const a = [] as Repo[]
            const b = [repo] as Repo[]
            expect(diffRepos(a, b)).toStrictEqual({
                added: [repo],
                changed: [],
                deleted: [],
            })
        })

        test('Returns repo as changed if it exists in a but has a newer lastPush date in b', () => {
            const repo = { fullName: 'org/repo1', lastPush: '2021-04-29T13:00:04Z', }
            const changedRepo = { fullName: 'org/repo1', lastPush: '2022-07-31T07:32:33Z', }
            const a = [repo] as Repo[]
            const dst = [changedRepo] as Repo[]
            expect(diffRepos(a, dst)).toStrictEqual({
                added: [],
                changed: [changedRepo],
                deleted: [],
            })
        })

        test('Returns repo as deleted if it exists in a but not in b', () => {
            const repo = { fullName: 'org/repo1' }
            const a = [repo] as Repo[]
            const b = [] as Repo[]
            expect(diffRepos(a, b)).toStrictEqual({
                added: [],
                changed: [],
                deleted: [repo],
            })
        })
    })

    describe('patchRepos', () => {
        test('Removes repos that have been marked as deleted in diff', () => {
            const repos = [{ fullName: 'org/repo1' }] as Repo[]
            const diff = { deleted: [{ fullName: 'org/repo1' }] } as RepoDiff

            expect(patchRepos(repos, diff)).toStrictEqual([])
        })

        test('Adds repos that have been marked as added', () => {
            const repos = [] as Repo[]
            const addedRepo = { fullName: 'org/repo1' }
            const diff = { added: [addedRepo] } as RepoDiff

            expect(patchRepos(repos, diff)).toStrictEqual([addedRepo])
        })

        test('Replaces repos that have been marked as modified', () => {
            const originalRepo = { fullName: 'org/repo1', cloneUrl: 'some/url.git' } as Repo
            const modifiedRepo = { fullName: 'org/repo1', cloneUrl: 'another/url.git' } as Repo
            const diff = { changed: [modifiedRepo] } as RepoDiff

            expect(patchRepos([originalRepo], diff)).toStrictEqual([modifiedRepo])
        })
    })
})