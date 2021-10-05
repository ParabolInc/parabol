module.exports = {
  apps: [
    {
      name: 'GQL/Socket Server',
      script: 'scripts/gqlServers.js',
      instances: 1,
      watch: ['packages/server', 'packages/gql-executor'],
      ignore_watch: ['**/__tests__'],
      max_memory_restart: '3000M',
      env_production: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'Web Server',
      script: 'scripts/hmrServer.js',
      instances: 1,
      watch: false,
      max_memory_restart: '3000M',
      env_production: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'Relay Compiler',
      script: 'scripts/relayCompiler.js',
      instances: 1,
      watch: ['schema.graphql'],
      max_memory_restart: '3000M',
      env_production: {
        NODE_ENV: 'development'
      }
    }
  ]
}
