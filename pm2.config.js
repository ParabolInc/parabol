module.exports = {
  apps: [
    {
      name: 'Web Server',
      script: 'dist/web.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '8192M',
      env_production: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'GQL Executor',
      script: 'dist/gqlExecutor.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '8192M',
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
