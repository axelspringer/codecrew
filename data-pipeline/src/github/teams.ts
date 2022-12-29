import { graphql } from "@octokit/graphql";

export type GithubTeam = {
    name: string,
    avatarUrl: string,
    teamsUrl: string,
    description: string,
    members: {
        email: string,
        ghUserName: string,
        avatarUrl: string,
    }[],
    createdAt: string,
}

export default listTeams

async function listTeams(organization: string, token: string, progressCb?: (recordsFound: number) => void): Promise<GithubTeam[]> {
    let teams = [] as GithubTeam[]

    let hasNextPage = true
    let cursor = null
    while (hasNextPage) {
        const res = await graphql(`
            query { 
                organization(login:"${organization}") {
                    teams(first:100, after:${cursor ? `"${cursor}"` : `null`}){
                        pageInfo{
                            hasNextPage,
                            endCursor,
                        },
                        nodes{
                            avatarUrl,
                            teamsUrl,
                            description,
                            createdAt,
                            name,
                            members{
                                nodes{
                                    email,
                                    login,
                                    avatarUrl,
                                }
                            }
                        }
                    }
                }
            }
        `, {
            headers: {
                authorization: `token ${token}`,
            }
        }) as ListTeamsGraphQLResponse

        const mappedTeams = mapTeams(res)
        teams = [...teams, ...mappedTeams]
        if (progressCb) { progressCb(teams.length) }

        hasNextPage = res.organization?.teams?.pageInfo?.hasNextPage || false
        cursor = res.organization?.teams?.pageInfo?.endCursor || null
    }

    return teams as GithubTeam[]
}

export type ListTeamsGraphQLResponse = {
    organization: {
        teams: {
            pageInfo: {
                hasNextPage: boolean,
                endCursor: string | null,
            },
            nodes: {
                name: string,
                avatarUrl: string,
                teamsUrl: string,
                description: string,
                members: {
                    nodes: {
                        email: string,
                        login: string,
                        avatarUrl: string,
                    }[],
                },
                createdAt: string,
            }[],
        }
    }
}
export const mapTeams = (graphQlRes: ListTeamsGraphQLResponse): GithubTeam[] => {
    const teamsRaw = graphQlRes.organization?.teams?.nodes || []

    return teamsRaw.map(({ name, avatarUrl, teamsUrl, description, members, createdAt }) => {
        const teamInfo = { name, avatarUrl, teamsUrl, description, createdAt }
        const memberNodes = members?.nodes || []
        const membersMapped = memberNodes.map(({ email, login: ghUserName = "", avatarUrl }) => ({ email, ghUserName, avatarUrl }))
        return { ...teamInfo, members: membersMapped } as GithubTeam
    }) as GithubTeam[]
}