module.exports = {
  apps: [
    {
      name: 'GQL/Socket Server',
      script: 'scripts/gqlServers.js',
      instances: 1,
      autorestart: true,
      watch: ['packages/server', 'packages/gql-executor'],
      ignore_watch: [
        '**/__tests__',
        'rootSchema.graphql',
        'resolverTypes.ts',
        'githubTypes.ts',
        'gitlabTypes.ts'
      ],
      max_memory_restart: '3000M',
      env_production: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'Web Server',
      script: 'scripts/hmrServer.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '3000M',
      env_production: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'Run DB Migrations',
      script: 'scripts/runMigrations.js',
      instances: 1,
      max_memory_restart: '3000M',
      env_production: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'Run Schema Updater',
      script: 'scripts/runSchemaUpdater.js',
      instances: 1,
      autorestart: true,
      watch: [
        'packages/server/graphql/public/typeDefs',
        'packages/server/graphql/private/typeDefs'
      ],
      max_memory_restart: '3000M',
      env_production: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'Watch Relay',
      script: 'scripts/watchRelay.js',
      instances: 1,
      autorestart: true,
      watch: ['packages/server/graphql/public/schema.graphql'],
      max_memory_restart: '3000M',
      env_production: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'Watch Codegen',
      script: 'scripts/watchCodegen.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '3000M',
      env_production: {
        NODE_ENV: 'development'
      }
    }
  ]
}
