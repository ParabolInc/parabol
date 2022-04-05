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
      watch: ['dev/gqlExecutor.js'],
      // if the watched file doeesn't exist, wait for it instead of restarting
      autorestart: false
    },
    {
      name: 'Socket Server',
      script: 'scripts/runSocketServer.js',
      // increase this to test scaling
      instances: 1,
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
      name: 'GraphQL Schema Updater',
      script: 'scripts/runSchemaUpdater.js',
      watch: ['packages/server/graphql/public/typeDefs', 'packages/server/graphql/private/typeDefs']
    },
    {
      name: 'Relay Compiler',
      script: 'scripts/compileRelay.js',
      args: '--watch',
      watch: ['packages/server/graphql/public/schema.graphql']
    },
    {
      name: 'GraphQL Codegen',
      script: 'scripts/codegenGraphQL.js',
      args: '--watch',
      autorestart: false,
      // SIGINT won't kill this process in fork mode >:-(
      // instances: 1 forces cluster mode
      instances: 1
    }
  ].map((app) => ({
    env_production: {
      NODE_ENV: 'development'
    },
    ...app
  }))
}
