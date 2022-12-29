import { logProvider } from "./helper"
import run from "./run"

export const showGitVersion = async () => {
    console.log('Using git version:')
    await run(['git', '--version'])
}

export const cloneAndCheckoutBranch = async (orgAndRepo: string, branch: string, outdir: string, ghpat: string) => {
    const cloneUrl = `https://sklls-cli:${ghpat}@github.com/${orgAndRepo}.git`
    const cloneCmd = ['git', 'clone', '--branch', branch, cloneUrl, outdir]
    await run(cloneCmd)
}

export const clone = async (verbose: boolean, orgAndRepo: string, outdir: string, ghpat: string) => {
    const cloneUrl = `https://sklls-cli:${ghpat}@github.com/${orgAndRepo}.git`
    const cloneCmd = ['git', 'clone', cloneUrl, outdir]
    await run(cloneCmd, logProvider(verbose))
}

export const checkout = async (verbose: boolean, branchName: string, workingDir: string) => {
    const cloneCmd = ['git', 'checkout', branchName]
    await run(cloneCmd, logProvider(verbose), workingDir)
}

export const commitAndPush = async (verbose: boolean, commitMessage: string, commitAuthor: string, commitEmail: string, branchName: string, workingDir: string) => {
    const cmds = [
        ['git', 'add', '.'],
        ['git', 'config', '--global', 'user.name', `"${commitAuthor}"`],
        ['git', 'config', '--global', 'user.email', `"${commitEmail}"`],
        ['git', 'commit', '-m', `'${commitMessage}'`, ],
        ['git', 'push', '-u', 'origin', branchName],
    ]

    for (const cmd of cmds) {
        await run(cmd, logProvider(verbose), workingDir)
    }
}

export const doesBranchExist = async (branchName: string, workingDir: string): Promise<boolean> => {
    const cmd = ['git', 'ls-remote', '--heads', 'origin', branchName]
    let output = ''
    await run(cmd, consoleOutput => output += consoleOutput, workingDir)
    if (output !== '') {
        return true
    }

    return false
}

export const createEmptyDataBranch = async (verbose: boolean, branchName: string, workingDir: string, userName: string, email: string): Promise<void> => {
    const cmds = [
        ['git', 'checkout', '--orphan', branchName],
        ['rm', '-rf', './**'],
        ['git', 'reset', '--hard'],
    ]

    for (const cmd of cmds) {
        await run(cmd, logProvider(verbose), workingDir)
    }
}