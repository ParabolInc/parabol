# Workflows

## Runners

To run `build.yml`, GitHub requires using a larger runner.
This is because we're webpackifying all the code in node_modules into a single `.js.`.
Doing all that transpiling can take a LOT of memory. 8GB+.
At this time, large GitHub-hosted runners are in beta.
To edit runners, or runner groups, please go here: https://github.com/organizations/ParabolInc/settings/actions/runners
Currently, we're using a 4-core, 16GB RAM runner & it builds the app in < 3 mins.
