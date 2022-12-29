export const rawFetcher = async (url: string) => fetch(url).then(res => res.text())

export const jsonFetcher = (url: string) => fetch(url).then((res) => res.json());

export const multiJsonFetcher = async (props: { [attributeName: string]: string }) => {
    const data = {} as any
    const requests = Object.entries(props).map(([attributeName, url]) => fetch(url).then(res => res.json().then(json => data[attributeName] = json)))
    await Promise.all(requests)
    return data
}