var spawn = require('child_process').spawn;

export default run

async function run(cmd: string[], onConsoleLog?: (newLine: string) => void, cwd = '',): Promise<number> {
    const cb = (onConsoleLog ? onConsoleLog : console.log)
    
    if (process.env.DEBUG) {
        console.log('----- CMD -----')
        console.log(JSON.stringify({cmd,cwd}, null, 2))
        console.log('---------------')
    }

    return new Promise((resolve, reject) => {
        const [cmdPart, ...args] = cmd
        var executedCmd = spawn(cmdPart, [...args], { cwd });
        executedCmd.stdout.on('data', (data: Buffer) => cb(data.toString()));
        executedCmd.stderr.on('data', (data: Buffer) => cb(data.toString()));

        executedCmd.on('exit', function (code: number) {
            if (code === 0) {
                resolve(code)
                return
            }

            reject(code)
        });
    })
}