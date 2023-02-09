// This is copied almost entirely from rethinkdb-migrate
// The only difference is this accepts a list of migrations instead of using a dynamic require
import chalk from 'chalk'
import nconf from 'nconf'
import * as path from 'path'
import {r, R} from 'rethinkdb-ts'

require('sucrase/register')

const MIGRATION_TABLE_NAME = '_migrations'
type MigrationFn = (r: R) => void

interface MigrationFile {
  up: MigrationFn
  down: MigrationFn
}

/*
  Read config from
  - arguments
  - environment variables
  - /database.json
 */
type Unpromise<T> = T extends (...args: any[]) => Promise<infer U> ? U : T

const getConfig = async (root: string) => {
  nconf
    .argv()
    .env()
    .file({file: path.join(root, 'database.json')})
  return {
    host: nconf.get('host'),
    port: nconf.get('port'),
    user: nconf.get('user') || 'admin',
    password: nconf.get('password') || '',
    db: nconf.get('db'),
    discovery: Boolean(nconf.get('discovery')) || false,
    timeout: nconf.get('timeout') || 5 * 60,
    authKey: nconf.get('authKey'),
    ssl: nconf.get('ssl'),
  }
}
type Config = Unpromise<typeof getConfig>

/*
  Connect to db
  If db does not yet exist, create it
 */
async function connectToDb(config: Config) {
  await r.connectPool(config)
  const dbs = await r.dbList().run()
  if (!dbs.includes(config.db)) {
    await r.dbCreate(config.db).run()
  }
  const tables = await r.tableList().run()
  if (!tables.includes(MIGRATION_TABLE_NAME)) {
    await r.tableCreate(MIGRATION_TABLE_NAME).run()
    await r.table(MIGRATION_TABLE_NAME).indexCreate('timestamp').run()
    await r.table(MIGRATION_TABLE_NAME).indexWait().run()
  }
  await r.db(config.db).wait({waitFor: 'ready_for_writes'}).run()
}

/*
  Compares completed migrations to files on disk
  Returns the migrations scripts with a timestamp newer than last
  completed migration in db.
  TODO: Change so that all non run migration scripts are returned
 */
async function getMigrationsExcept(
  completedMigration: Migration | undefined,
  migrations: Record<string, MigrationFile>,
  numToApply: -1 | 1,
) {
  const allMigrations = Object.entries(migrations).map(([filename, code]) => {
    const tsix = filename.indexOf('-')
    return {
      name: filename.substring(tsix + 1, filename.lastIndexOf('.')),
      timestamp: filename.substring(0, tsix),
      filename: filename,
      code
    }
  }).filter((migration) => {
    return completedMigration ? migration.timestamp > completedMigration.timestamp : true
  })
  return numToApply !== -1 ? allMigrations.slice(0, numToApply) : allMigrations
}

/*
  Takes a list of migration file paths and requires them
 */
function requireMigrations(runMigrations: Migration[], migrations: Record<string, MigrationFile>) {
  return runMigrations.map(function (migration) {
    const filename = migration.timestamp + '-' + migration.name
    const filenames = Object.keys(migrations)
    const matchingFilename = filenames.find((name) => name.includes(migration.timestamp))!
    return {
      ...migration,
      filename,
      code: migrations[matchingFilename]
    }
  })
}

/*
  Run all new up migrations
 */

interface Params {
  root?: string
  all?: boolean
  migrations: Record<string, MigrationFile>
}

interface Migration {
  id: string
  name: string
  timestamp: string
}

export async function up(params: Params): Promise<void> {
  const {all, root, migrations: inMigrations} = params
  const rootDir = root || process.cwd()
  await connectToDb(await getConfig(rootDir))
  const completedMigrations = await r
    .table<Migration>(MIGRATION_TABLE_NAME)
    .orderBy({index: 'timestamp'})
    .run()
  const latest = completedMigrations[completedMigrations.length - 1]
  const numToApply = all ? -1 : 1
  const migrations = await getMigrationsExcept(latest, inMigrations, numToApply)
  if (migrations.length < 1) {
    logInfo('No new migrations')
    await r.getPoolMaster()?.drain()
    return
  }
  for (let i = 0; i < migrations.length; i++) {
    const migration = migrations[i]
    logInfo(chalk.black.bgGreen(' ↑  up  ↑ '), migration.timestamp, chalk.yellow(migration.name))
    const {name, timestamp} = migration
    try {
      await migration.code.up(r)
    } catch (e) {
      logError(`Migration failed: ${name}`, e as any)
      await r.getPoolMaster()?.drain()
      return
    }
    await r.table(MIGRATION_TABLE_NAME).insert({name, timestamp}).run()
  }
  logInfo('Migration Successful')
  await r.getPoolMaster()?.drain()
}

/*
  Rollback one or all migrations
 */
export async function down(params: Params): Promise<void> {
  const {all, root, migrations: inMigrations} = params
  const rootDir = root || process.cwd()
  await connectToDb(await getConfig(rootDir))
  const completedMigrations = await r
    .table<Migration>(MIGRATION_TABLE_NAME)
    .orderBy({index: 'timestamp'})
    .run()
  if (completedMigrations.length === 0) {
    logInfo('No new migrations')
    await r.getPoolMaster()?.drain()
    return
  }
  const migrationsToRollBack = all
    ? completedMigrations.reverse()
    : [completedMigrations[completedMigrations.length - 1]]
  const migrations = requireMigrations(migrationsToRollBack, inMigrations)
  for (let i = 0; i < migrations.length; i++) {
    const migration = migrations[i]
    logInfo(chalk.black.bgYellow(' ↓ down ↓ '), migration.timestamp, chalk.yellow(migration.name))
    const {name} = migration
    try {
      await migration.code.down(r)
    } catch (e) {
      logError(`Migration failed: ${name}`, e as any)
      await r.getPoolMaster()?.drain()
      return
    }
    await r.table(MIGRATION_TABLE_NAME).get(migration.id).delete().run()
  }
  logInfo('Migration successful')
  await r.getPoolMaster()?.drain()
}

function logInfo(...args: any[]) {
  args.unshift(chalk.blue('[migrate-rethinkdb]'))
  console.log(args.join(' '))
}

function logError(txt: string, error: Error) {
  console.error(chalk.red('[migrate-rethinkdb] ') + txt)
  if (error) {
    console.error(error)
    if (error.stack) {
      console.error(error.stack)
    }
  }
}
