module.exports = {
  apps: [
    {
      name: 'Web Server',
      script: 'dist/web.js',
      instances: 1,
      increment_var: 'SERVER_ID',
      autorestart: true,
      watch: false,
      max_memory_restart: '8192M',
      env_production: {
        NODE_ENV: 'production',
        SERVER_ID: 0
      }
    },
    {
      name: 'GQL Executor',
      script: 'dist/gqlExecutor.js',
      instances: 2,
      increment_var: 'SERVER_ID',
      autorestart: true,
      watch: false,
      max_memory_restart: '8192M',
      env_production: {
        NODE_ENV: 'production',
        SERVER_ID: 3
      }
    }
  ]
}
