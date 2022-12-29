import { graphql } from "@octokit/graphql";

export type GithubSsoIdentity = {
    ssoEmail: string,
    ghUserName: string,
}

export default listSSOIdentities

async function listSSOIdentities (organization: string, token: string, progressCb?: (recordsFound: number) => void): Promise<GithubSsoIdentity[]> {
    let developers = [] as GithubSsoIdentity[]

    let hasNextPage = true
    let cursor = null
    while (hasNextPage) {
        const res = await graphql(
            `
            query{
                organization(login: "${organization}") {
                    samlIdentityProvider {
                        ssoUrl,
                        externalIdentities(first: 100, after:${cursor ? `"${cursor}"` : `null`}) {
                        pageInfo{
                            endCursor
                            hasNextPage
                        }
                        edges {
                            node {
                                guid,
                                samlIdentity {
                                    nameId
                                }
                                    user {
                                    login
                                }
                            }
                        }
                        }
                    }
                }
            }
            `,
            {
              headers: {
                authorization: `token ${token}`,
              },
            }
          ) as SSOGraphQlResponse;
    
        const mappedDevelopers = mapDevelopers(res)
        developers = [...developers, ...mappedDevelopers]
        if (progressCb) { progressCb(developers.length) }

        hasNextPage = res.organization.samlIdentityProvider?.externalIdentities?.pageInfo?.hasNextPage || false
        cursor = res.organization.samlIdentityProvider?.externalIdentities?.pageInfo?.endCursor || null
    }

    return developers
}

export type SSOGraphQlResponse = {
    organization: {
        samlIdentityProvider: {
            ssoUrl: string,
            externalIdentities: {
                pageInfo: {
                    endCursor: string,
                    hasNextPage: boolean,
                },
                edges: {
                    node: {
                        guid: string,
                        samlIdentity: {
                            nameId: string,
                        },
                        user: {
                            login: string,
                        }
                    }
                }[],
            }
        }
    }
}
export const mapDevelopers = (graphQlRes: SSOGraphQlResponse): GithubSsoIdentity[] => {
    const developersRaw = graphQlRes.organization.samlIdentityProvider?.externalIdentities?.edges || []
    return developersRaw.map(({ node: { samlIdentity: {nameId: ssoEmail }, user } }) => ({ ssoEmail, ghUserName: user?.login || "" })) as GithubSsoIdentity[]
}