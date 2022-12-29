export type GithubFetcherFn<T> = (organization: string, token: string, progressCb?: (recordsFound: number) => void) => Promise<T[]>