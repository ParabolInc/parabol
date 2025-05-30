const {DEV_RUN_ONLY} = process.env
// const DEV_RUN_ONLY = 'Webpack Servers,Socket Server,Dev Server'
const runOnly = DEV_RUN_ONLY ? DEV_RUN_ONLY.split(',') : []
module.exports = {
  apps: [
    {
      name: 'Webpack Servers',
      script: 'scripts/buildServers.js'
    },
    {
      name: 'Socket Server',
      script: 'scripts/runSocketServer.js',
      // increase this to test scaling
      instances: 1,
      increment_var: 'SERVER_ID',
      env: {
        SERVER_ID: 0
      },
      watch: ['dev/web.js'],
      // if the watched file doeesn't exist, wait for it instead of restarting
      autorestart: false
    },
    {
      name: 'Embedder',
      script: 'scripts/runEmbedder.js',
      // increase this to test scaling
      instances: 1,
      increment_var: 'SERVER_ID',
      env: {
        SERVER_ID: 6
      },
      watch: ['dev/embedder.js'],
      // if the watched file doeesn't exist, wait for it instead of restarting
      autorestart: false
    },
    {
      name: 'Dev Server',
      script: 'scripts/hmrServer.js'
    },
    {
      name: 'Flush Redis',
      script: 'scripts/flushRedis.js',
      autorestart: false
    },
    {
      name: 'PG Migrations',
      script: 'pnpm kysely migrate:latest',
      autorestart: false
    },
    {
      name: 'Relay Compiler',
      script: 'scripts/relayWatch.js',
      watch: [
        'packages/server/graphql/public/schema.graphql',
        'packages/server/graphql/public/typeDefs',
        'packages/server/graphql/private/typeDefs',
        'packages/client/clientSchema.graphql'
      ]
    },
    {
      name: 'GraphQL Codegen',
      script: 'scripts/codegenGraphQL.js',
      args: '--watch',
      autorestart: false,
      // SIGINT won't kill this process in fork mode >:-(
      // instances: 1 forces cluster mode
      instances: 1
    },
    {
      name: 'Kysely Codegen',
      script: 'pnpm pg:generate',
      autorestart: false
    },
    {
      name: 'PG Typed',
      script: 'pnpm pg:build',
      watch: ['packages/server/postgres/queries/src/*.sql'],
      autorestart: false
    },
    {
      name: 'Mattermost Relay Compiler',
      script: 'pnpm --filter parabol-mattermost-plugin exec relay-compiler',
      watch: ['packages/mattermost-plugin/**/*.[ts*,js*,css]'],
      autorestart: false,
      instances: 1
    },
    {
      name: 'Mattermost Plugin Dev Server',
      script: './scripts/hmrServer.js',
      cwd: 'packages/mattermost-plugin'
    }
  ]
    .map((app) => ({
      env_production: {
        NODE_ENV: 'development'
      },
      ...app
    }))
    .filter((app) => (runOnly.length === 0 ? true : runOnly.includes(app.name)))
}
