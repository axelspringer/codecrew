# codecrew UI

## Development
1. Run `yarn setup-data` to clone the data branch into this folder (data-pipeline job must have run through successfully at least once)
2. Run `yarn start` to start the development server (both starts the `create-react-app` server and a data-server)
3. Run `yarn start` to run the React app + a data proxy pointing to the clone repo (`/data`)
4. The codecrew UI now runs on `http://localhost:80`