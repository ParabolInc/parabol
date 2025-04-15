module.exports = {
  apps: [
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
    }
  ]
}
