import * as fs from 'fs'
import * as path from 'path'
import { mapReducer, PushToChannelFn } from "../OLDmapreduce";

async function main(fileName: string) {
    const jobs = fs.readFileSync(fileName, { encoding: 'utf-8' }).split(/\r?\n/)

    const map = async (job: any, pushToReducer: PushToChannelFn) => {
        if (job.trim() === '') {
            return
        }

        job.split(' ').forEach(async (word: string) => {
            await pushToReducer(word, 1)
        })
    }

    const reduce = async (channelName: string, values: any[], pushToResults: PushToChannelFn) => {
        let count = 0
        values.forEach(value => count += value)
        await pushToResults(channelName, count)
    }

    const wordCounts = await mapReducer(jobs, map, reduce)

    // Just cosmetics: Sort results!
    const sortedResults = wordCounts.sort((a, b) => {
        if (a[1] > b[1]) {
            return -1;
        }
        if (a[1] < b[1]) {
            return 1;
        }
        // a must be equal to b
        return 0;
    })

    sortedResults.forEach((sortedResult, i) => {
        if (i < 30) {
            console.log(JSON.stringify(sortedResult))
        }
    })
}

main(path.join(__dirname, './grundgesetz.txt'))