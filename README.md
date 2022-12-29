![codecrew logo](/docs/codecrew-logo-with-text.svg)

> sklls is a POC and not actively maintained

codecrew makes it easy to discover the software developers inside your Github organization based on techstack. It auto-generates data utilizing [sklls cli](https://github.com/axelspringer/sklls-cli) which uses git-blames to generate tech-usage profiles for every member of a Github organization.  

> The purpose of this proof-of-concept was to figure out how to better connect software developers at Axel Springer based on tech-skills. [Read more in our blogpost]() TODO!

# Demo
![codecrew demo](/docs/codecrew-demo.gif)

# Setup
> These are old instructions - please check out the github actions and `/data-pipeline/index.ts` for instructions on how to setup the data pipeline in your own Github org
1. Fork this repo
2. Create a personal access token with push & pull rights to the forked repo, and add it as a `CODECREW_TOKEN` action secret
3. Create another personal access token (TODO: Add details about creating correct access rights) and add is as a `ALL_REPOS_ACCESS_TOKEN` action secret
4. **TODO**: Cleanup the README :)
2. Add a repository secret, named `ALL_REPOS_ACCESS_TOKEN` (Todo: Rename to `CODECREW_GHPAT`):
    - As a value, enter a Github Personal Access Token with the following rights:
        - `repo` (needed to list all repos)
        - `admin:org` (needed only if you want to use SAML identities TODO: Make that configurable)
    - If your Github Org has SOO configured, don't forget to [authorize the Personal Access Token](https://docs.github.com/en/enterprise-cloud@latest/authentication/authenticating-with-saml-single-sign-on/authorizing-a-personal-access-token-for-use-with-saml-single-sign-on)
3. Adapt `config.js` to your needs
4. Make sure the scheduled Github action runs through successfully (will roughly scan ~3600 repos / 24h - GH's cron schedule is very inaccurate though)

# License
MIT

![codecrew mascots](/docs/codecrew-mascots.png)
*Logo & codecrew mascots designed by the talented Zoe-Melody Janser*