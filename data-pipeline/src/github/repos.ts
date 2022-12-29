import { graphql } from "@octokit/graphql";

export type GithubRepo = {
    name: string,
    fullName: string,
    description: string,
    url: string,
    cloneUrl: string,
    fork: boolean,
    defaultBranch: string,
    lastPush: string,
    stargazerCount: number,
    visibility: RepoVisibility,
    isEmpty: boolean,
    isLocked: boolean,
    isTemplate: boolean,
    isArchived: boolean,
    isDisabled: boolean,
}

export enum RepoVisibility {
    INTERNAL = 'INTERNAL',
    PRIVATE = 'PRIVATE',
    PUBLIC = 'PUBLIC',
}

export default listRepos

async function listRepos (organization: string, token: string, progressCb?: (recordsFound: number) => void): Promise<GithubRepo[]> {
    let repos = [] as GithubRepo[]

    let hasNextPage = true
    let cursor = null
    while (hasNextPage) {
        const res = await graphql(
            `
            query{
                organization(login:"${organization}"){
                    repositories(first:100, isFork:false, after:${cursor ? `"${cursor}"` : `null`}) {
                        pageInfo{
                            endCursor,
                            hasNextPage,
                        },
                        nodes{
                            name,
                            nameWithOwner,
                            url,
                            description,
                            sshUrl,
                            defaultBranchRef {
                                name,
                            },
                            visibility,
                            stargazerCount,
                            pushedAt,
                            isEmpty,
                            isLocked,
                            isTemplate,
                            isArchived,
                            isDisabled,
                        }
                    }
                }
            }`,
            {
              headers: {
                authorization: `token ${token}`,
              },
            }
          ) as RepositoryGraphQlResponse;
    
        const mappedRepos = mapRepos(res)
        repos = [...repos, ...mappedRepos]
        if (progressCb) { progressCb(repos.length) }

        hasNextPage = res.organization?.repositories?.pageInfo.hasNextPage || false
        cursor = res.organization?.repositories?.pageInfo.endCursor || null
    }

    return repos
}

export type RepositoryGraphQlResponse = {
    organization: {
        repositories: {
            pageInfo: {
                endCursor: string,
                hasNextPage: boolean,
            },
            nodes: {
                name: string,
                nameWithOwner: string,
                url: string,
                sshUrl: string,
                description: string,
                defaultBranchRef: {
                    name: string,
                },
                visibility: 'INTERNAL' | 'PRIVATE' | 'PUBLIC',
                stargazerCount: number,
                pushedAt: string,

                isEmpty: boolean,
                isLocked: boolean,
                isTemplate: boolean,
                isArchived: boolean,
                isDisabled: boolean,
            }[],
        }
    }
}
export const mapRepos = (graphQlRes: RepositoryGraphQlResponse): GithubRepo[] => {
    const reposRaw = graphQlRes.organization?.repositories?.nodes || []
    return reposRaw.map(({
        name,
        nameWithOwner: fullName,
        url,
        description,
        sshUrl: cloneUrl,
        defaultBranchRef,
        visibility,
        stargazerCount,
        pushedAt: lastPush,
        isEmpty,
        isLocked,
        isTemplate,
        isArchived,
        isDisabled,
    }) =>
        ({ name, fullName, description, url, cloneUrl, defaultBranch: defaultBranchRef?.name || '', lastPush, stargazerCount, visibility, isEmpty, isLocked, isTemplate, isArchived, isDisabled })) as GithubRepo[]
}