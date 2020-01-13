module.exports = {
  apps: [
    {
      name: 'Server',
      script: 'server.babel.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1228M',
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
