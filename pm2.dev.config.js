module.exports = {
  apps: [
    {
      name: 'Build Servers',
      script: 'scripts/buildServers.js'
    },
    {
      name: 'Run Executor',
      script: 'scripts/runExecutor.js',
      instances: 1,
      watch: ['dev/gqlExecutor.js']
    },
    {
      name: 'Run Socket Server',
      script: 'scripts/runSocketServer.js',
      instances: 1,
      watch: ['dev/web.js']
    },
    {
      name: 'Web Server',
      script: 'scripts/hmrServer.js'
    },
    {
      name: 'Run DB Migrations',
      script: 'scripts/runMigrations.js',
      autorestart: false
    },
    {
      name: 'Run Schema Updater',
      script: 'scripts/runSchemaUpdater.js',
      watch: ['packages/server/graphql/public/typeDefs', 'packages/server/graphql/private/typeDefs']
    },
    {
      name: 'Watch Relay',
      script: 'scripts/watchRelay.js',
      watch: ['packages/server/graphql/public/schema.graphql']
    },
    {
      name: 'Watch Codegen',
      script: 'scripts/watchCodegen.js'
    }
  ].map((app) => ({
    env_production: {
      NODE_ENV: 'development'
    },
    ...app
  }))
}
