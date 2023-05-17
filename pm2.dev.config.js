module.exports = {
  apps: [
    {
      name: 'Webpack Servers',
      script: 'scripts/buildServers.js'
    },
    {
      name: 'GraphQL Executor',
      script: 'scripts/runExecutor.js',
      // increase this to test scaling
      instances: 1,
      increment_var: 'SERVER_ID',
      env: {
        SERVER_ID: 3
      },
      watch: ['dev/gqlExecutor.js'],
      // if the watched file doeesn't exist, wait for it instead of restarting
      autorestart: false
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
      name: 'Dev Server',
      script: 'scripts/hmrServer.js'
    },
    {
      name: 'DB Migrations',
      script: 'scripts/runMigrations.js',
      // once this completes, it will exit
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
      script: 'yarn pg:generate',
      autorestart: false
    },
    {
      name: 'PG Typed',
      script: 'yarn pg:build -w'
    }
  ].map((app) => ({
    env_production: {
      NODE_ENV: 'development'
    },
    ...app
  }))
}
