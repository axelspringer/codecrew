import useSWR from 'swr'
import { rawFetcher } from '../helper/fetchers'

export default LastUpdatePage

function LastUpdatePage() {
    const { data, error } = useSWR('/data/last-update.txt', rawFetcher)
  
    if (error) return <div>failed to load</div>
    if (!data) return <div>loading...</div>
    return <div>Last data update: {data}</div>
  }