import { GithubRepo } from "../github/repos"

export default getRepoDiff

function getRepoDiff(verbose: boolean, currentRepos: GithubRepo[], previousRepos: GithubRepo[], limit: Number): RepoDiff {
    // Get the repo diff
    let currentLimit = 0
    const diff = diffRepos(previousRepos, currentRepos)
    const limitedDiff = {
        added: [] as GithubRepo[],
        changed: [] as GithubRepo[],
        deleted: [] as GithubRepo[],
    }

    diff.added.forEach(repo => {
        if (currentLimit < limit || limit === -1) {
            limitedDiff.added.push(repo)
        }
        currentLimit += 1
    })

    diff.changed.forEach(repo => {
        if (currentLimit < limit || limit === -1) {
            limitedDiff.changed.push(repo)
        }
        currentLimit += 1
    })

    diff.deleted.forEach(repo => {
        if (currentLimit < limit || limit === -1) {
            limitedDiff.deleted.push(repo)
        }
        currentLimit += 1
    })

    if (verbose) {
        console.log(`Found ${currentRepos.length} repos, loaded ${previousRepos.length} existing repos, returning ${limitedDiff.added.length} added, ${limitedDiff.changed.length} changed and ${limitedDiff.deleted.length} deleted repos to update pipeline.`)
    }

    return limitedDiff
}

export type RepoDiff = {
    added: GithubRepo[],
    changed: GithubRepo[],
    deleted: GithubRepo[],
}

export function diffRepos(a: GithubRepo[], b: GithubRepo[]): RepoDiff {
    const aMap = {} as { [fullName: string]: GithubRepo }
    const bMap = {} as { [fullName: string]: GithubRepo }

    a.forEach(repo => aMap[repo.fullName] = repo)
    b.forEach(repo => bMap[repo.fullName] = repo)

    const diff = {
        added: [] as GithubRepo[],
        changed: [] as GithubRepo[],
        deleted: [] as GithubRepo[],
    }

    // Find the new & changed repos
    let consideredKeys = [] as string[]
    b.forEach(repo => {
        const { fullName, lastPush } = repo
        consideredKeys.push(fullName)

        // Repo was added (does not exist in a)
        if (!aMap[fullName]) {
            diff.added.push(repo)
            return
        }

        // Repo was changed (newer date than in a)
        const lastPushB = new Date(bMap[fullName].lastPush)
        const lastPushA = new Date(aMap[fullName].lastPush)

        if (lastPushB.getTime() > lastPushA.getTime()) {
            diff.changed.push(repo)
            return
        }
    })

    // Find the deleted repos
    Object.keys(aMap).forEach(key => {
        if (!consideredKeys.includes(key)) {
            const repo = aMap[key]
            diff.deleted.push(repo)
            return
        }
    })

    return diff
}

export function patchRepos(repos: GithubRepo[], repoDiff: RepoDiff): GithubRepo[] {
    const findRepo = (repo = {} as GithubRepo, repos = [] as GithubRepo[]) => repos.find(r => r.fullName === repo.fullName)

    // Delete deleted repos
    let patchedRepos = repos.filter(r => !findRepo(r, repoDiff.deleted))

    // Modify changed repos
    patchedRepos = patchedRepos.map(r => {
        const changedRepo = findRepo(r, repoDiff.changed)
        if (changedRepo) {
            return changedRepo
        }

        return r
    })

    // Add new repos
    patchedRepos = patchedRepos.concat(repoDiff.added || [])

    return patchedRepos
}