module.exports = {
  apps: [
    {
      name: 'Web Server',
      script: 'dist/web.js',
      instances: 2,
      increment_var: 'PORT',
      autorestart: true,
      watch: false,
      env: {
        PORT: 3000
      },
      max_memory_restart: '8192M',
      env_production: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'Embedder',
      script: 'dist/embedder.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '4096M',

      env: {},
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
