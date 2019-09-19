module.exports = {
  apps : [{
    name: 'Server',
    script: 'server.babel.js',
//    exec_mode: 'cluster',
//    instances: 'max',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production'
    }
  }],
}

