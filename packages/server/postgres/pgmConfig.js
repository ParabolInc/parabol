const getPgSSL = require('./getPgSSL')

const pgmConfig = {
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  ssl: getPgSSL() ?? undefined,
  tsconfig: 'packages/server/tsconfig.json',
  'migrations-dir': 'packages/server/postgres/migrations',
  'migrations-table': 'PgMigrations',
  'template-file-name': 'packages/server/postgres/migrationTemplate.ts'
}

module.exports = pgmConfig
