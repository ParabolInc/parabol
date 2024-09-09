module.exports = {
  apps: [
    {
      name: 'Chronos',
      script: 'dist/chronos.js',
      instances: 1, // there can only be 1
      increment_var: 'SERVER_ID',
      autorestart: true,
      watch: false,
      max_memory_restart: '4096M',
      env: {
        SERVER_ID: 1
      },
      env_production: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'Web Server',
      script: 'dist/web.js',
      instances: 2,
      increment_var: 'SERVER_ID',
      autorestart: true,
      watch: false,
      max_memory_restart: '8192M',
      env: {
        SERVER_ID: 2
      },
      env_production: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'Embedder',
      script: 'dist/embedder.js',
      instances: 1,
      increment_var: 'SERVER_ID',
      autorestart: true,
      watch: false,
      max_memory_restart: '4096M',
      env: {
        SERVER_ID: 5
      },
      env_production: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'GQL Executor',
      script: 'dist/gqlExecutor.js',
      instances: 2,
      increment_var: 'SERVER_ID',
      autorestart: true,
      watch: false,
      max_memory_restart: '24576M',
      env: {
        SERVER_ID: 6
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
