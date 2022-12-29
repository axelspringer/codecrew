# Codecrew Data Pipeline
The special thing about codecrew is that all the data presented is automatically derived from git logs, using the [sklls CLI](https://github.com/spring-media/sklls-cli).

# Requirements
- Docker installed

# Run datapipline
`$ export GH_TOKEN=$(cat <path-to-your-GH-PAT>) && yarn start`

# Build image & start shell inside it (for debugging purposes)
`$ export GH_TOKEN=$(cat <path-to-your-GH-PAT>) && yarn debug`

# Configuring data pipeline
The data pipeline can be configured through settings in `config.js`.