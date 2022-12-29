export async function mapReducer<ResultType>(
    jobs: any[],
    map: (job: any, pushToReducer: PushToChannelFn) => Promise<void>,
    reduce: (channelName: string, values: ResultType[], pushToResults: PushToChannelFn) => Promise<void>,
): Promise<[channelName: string, value: ResultType][]> {
    const reducerChannels: { [channelName: string]: any[] } = {}
    const pushToReducerChannel = (channelName: string, value: any) => {
        if (!reducerChannels[channelName]) {
            reducerChannels[channelName] = []
        }
        reducerChannels[channelName].push(value)
        return Promise.resolve()
    }

    // Run map function on every job
    await Promise.all(jobs.map(job => map(job, pushToReducerChannel)))

    const results: [string, any][] = []
    const pushToResultsChannel = (channelName: string, value: any) => {
        results.push([channelName, value])
        return Promise.resolve()
    }

    // Run reduce function on all key-value pairs from the reducer channels
    await Promise.all(Object.entries(reducerChannels).map(([channelName, values]) => reduce(channelName, values, pushToResultsChannel)))

    return results
}

export type PushToChannelFn = (channelName: string, value: any) => Promise<void>

