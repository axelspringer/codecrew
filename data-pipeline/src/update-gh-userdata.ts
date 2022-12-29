import { loadConfig } from "./pipeline/config";
import runDataPipeline, { PipelineMode } from "./pipeline";

(async function main() {
    try {
        const config = loadConfig('../../../config.js')
        await runDataPipeline(
            PipelineMode.UpdateGithubData,
            config,
            process.env.CODECREW_TOKEN,
            // TODO: Remove this! (Or document it properly)
            process.env.DATA_REPO_TOKEN,
        )
    } catch (error: any) {
        console.log('Error while trying to run the data-pipeline:\n', error)
        process.exit(1)
    }

    console.log('\nData pipeline finished successfully ✨')
}())