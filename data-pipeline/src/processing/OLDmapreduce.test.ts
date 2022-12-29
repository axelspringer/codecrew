import { mapReducer, PushToChannelFn } from "./mapreduce"

describe('mapReducer', () => {
    test('Runs mapreduce jobs successfully', async () => {
        // a = 2x
        // b = 4x
        // c = 6x
        const jobs = [
            ['a', 'b', 'c'],
            ['b', 'b', 'c', 'c', 'c', 'c', 'c'],
            ['a', 'b',]
        ]
        const map = async (job: any, pushToReducer: PushToChannelFn) => {
            await Promise.all(job.map((letter: string) => pushToReducer(letter, 1)))
        }

        const reduce = async (channelName: string, values: any[], pushToResults: PushToChannelFn) => {
            let count = 0
            values.forEach((letterCount: number) => count += letterCount)
            await pushToResults(channelName, count)
        }

        const results = await mapReducer(jobs, map, reduce)
        expect(results).toStrictEqual([['a', 2], ['b', 4], ['c', 6]])
    })
})