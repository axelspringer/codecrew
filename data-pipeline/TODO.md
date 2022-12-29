# TODO Data Pipeline
Goal: Finish the data pipeline to the point where I simply have a bunch of JSONs to consume in the frontend.  

- [x] Refactor `pipeline/index.ts` functions to only consume flat values
- [x] Change folders so that the sklls-data is in `__sklls-data__` (to make the rest of the data folder easily consumable through the UI)
- [x] Fix babette.wagner@axelspringer.com bug
- [x] Filter out `.lock`, `"" (empty)` and `.png` (etc) extensions from skills and profiles that didn't commit for 3 months
- [x] Make sure to reverse-merge matching usernames (into the username --> Email mapping) (already happening through the MapReduce in `getUsernameEmailMapping()`)
- [x] Create separate PR to store sklls-data in `__codecrew__/sklls-data`
- [x] Use cached values for user data (not for repos) in `pipeline/github.ts`
- [x] Make sure to update the github data only once / day (for now in the same data pipeline job - later that might have to go into a separate GH action)
- [x] Move existing data in `data` branch that is not consumed by UI into `data/__codecrew__`
- [x] Build aggregates for `teams` and `users` pages (try the simplest way possible for now - just IDs and the UI will fetch each profile individually)
- [x] Create Github Action to update the Github data periodically
- [x] Delete the `new-github-token-test.yml` Github Action

- [x] Build developers page
- [x] Build teams page
- [ ] Add filtering to both pages
- [ ] Bugfix: Add `LastCommit` date to teams.json data
- [ ] Make sure data pipeline works again (currently there seems to be an issue with the key used for cloning)