// This is copied almost entirely from pg-migrate
// The only difference is this accepts a list of migrations instead of using a dynamic require
import Db, {DBConnection} from 'node-pg-migrate/dist/db'
import {Migration, RunMigration} from 'node-pg-migrate/dist/migration'
import {
  Logger, MigrationBuilderActions,
  MigrationDirection, RunnerOption, RunnerOptionClient,
  RunnerOptionUrl
} from 'node-pg-migrate/dist/types'
import {createSchemalize, getMigrationTableSchema, getSchemas} from 'node-pg-migrate/dist/utils'

// Random but well-known identifier shared by all instances of node-pg-migrate
const PG_MIGRATE_LOCK_ID = 7241865325823964

const idColumn = 'id'
const nameColumn = 'name'
const runOnColumn = 'run_on'

type OptsWithMigs = RunnerOption & {migrations: Record<string, MigrationBuilderActions>}
const loadMigrations = async (db: DBConnection, options: OptsWithMigs, logger: Logger) => {
  try {
    const {migrations} = options
    // let shorthands: ColumnDefinitions = {}
    return Object.entries(migrations).map(([filePath, actions]) => {
      return new Migration(
        db,
        filePath,
        actions,
        options,
        {
          // ...shorthands,
        },
        logger,
      )
    })
      .sort((m1, m2) => {
        const compare = m1.timestamp - m2.timestamp
        if (compare !== 0) return compare
        return m1.name.localeCompare(m2.name)
      })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    throw new Error(`Can't get migration files: ${err.stack}`)
  }
}

const lock = async (db: DBConnection): Promise<void> => {
  const [result] = await db.select(`select pg_try_advisory_lock(${PG_MIGRATE_LOCK_ID}) as "lockObtained"`)
  if (!result.lockObtained) {
    throw new Error('Another migration is already running')
  }
}

const unlock = async (db: DBConnection): Promise<void> => {
  const [result] = await db.select(`select pg_advisory_unlock(${PG_MIGRATE_LOCK_ID}) as "lockReleased"`)

  if (!result.lockReleased) {
    throw new Error('Failed to release migration lock')
  }
}

const ensureMigrationsTable = async (db: DBConnection, options: RunnerOption): Promise<void> => {
  try {
    const schema = getMigrationTableSchema(options)
    const {migrationsTable} = options
    const fullTableName = createSchemalize(
      Boolean(options.decamelize),
      true,
    )({
      schema,
      name: migrationsTable,
    })

    const migrationTables = await db.select(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = '${schema}' AND table_name = '${migrationsTable}'`,
    )

    if (migrationTables && migrationTables.length === 1) {
      const primaryKeyConstraints = await db.select(
        `SELECT constraint_name FROM information_schema.table_constraints WHERE table_schema = '${schema}' AND table_name = '${migrationsTable}' AND constraint_type = 'PRIMARY KEY'`,
      )
      if (!primaryKeyConstraints || primaryKeyConstraints.length !== 1) {
        await db.query(`ALTER TABLE ${fullTableName} ADD PRIMARY KEY (${idColumn})`)
      }
    } else {
      await db.query(
        `CREATE TABLE ${fullTableName} ( ${idColumn} SERIAL PRIMARY KEY, ${nameColumn} varchar(255) NOT NULL, ${runOnColumn} timestamp NOT NULL)`,
      )
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    throw new Error(`Unable to ensure migrations table: ${err.stack}`)
  }
}

const getRunMigrations = async (db: DBConnection, options: RunnerOption) => {
  const schema = getMigrationTableSchema(options)
  const {migrationsTable} = options
  const fullTableName = createSchemalize(
    Boolean(options.decamelize),
    true,
  )({
    schema,
    name: migrationsTable,
  })
  return db.column(nameColumn, `SELECT ${nameColumn} FROM ${fullTableName} ORDER BY ${runOnColumn}, ${idColumn}`)
}

const getMigrationsToRun = (options: RunnerOption, runNames: string[], migrations: Migration[]): Migration[] => {
  if (options.direction === 'down') {
    const downMigrations: Array<string | Migration> = runNames
      .filter((migrationName) => !options.file || options.file === migrationName)
      .map((migrationName) => migrations.find(({name}) => name === migrationName) || migrationName)
    const {count = 1} = options
    const toRun = (
      options.timestamp
        ? downMigrations.filter((migration) => typeof migration === 'object' && migration.timestamp >= count)
        : downMigrations.slice(-Math.abs(count))
    ).reverse()
    const deletedMigrations = toRun.filter((migration): migration is string => typeof migration === 'string')
    if (deletedMigrations.length) {
      const deletedMigrationsStr = deletedMigrations.join(', ')
      throw new Error(`Definitions of migrations ${deletedMigrationsStr} have been deleted.`)
    }
    return toRun as Migration[]
  }
  const upMigrations = migrations.filter(
    ({name}) => runNames.indexOf(name) < 0 && (!options.file || options.file === name),
  )
  const {count = Infinity} = options
  return options.timestamp
    ? upMigrations.filter(({timestamp}) => timestamp <= count)
    : upMigrations.slice(0, Math.abs(count))
}

const checkOrder = (runNames: string[], migrations: Migration[]) => {
  const len = Math.min(runNames.length, migrations.length)
  for (let i = 0; i < len; i += 1) {
    const runName = runNames[i]
    const migrationName = migrations[i].name
    if (runName !== migrationName) {
      throw new Error(`Not run migration ${migrationName} is preceding already run migration ${runName}`)
    }
  }
}

const runMigrations = (toRun: Migration[], method: 'markAsRun' | 'apply', direction: MigrationDirection) =>
  toRun.reduce(
    (promise: Promise<unknown>, migration) => promise.then(() => migration[method](direction)),
    Promise.resolve(),
  )

const getLogger = ({log, logger, verbose}: RunnerOption): Logger => {
  let loggerObject: Logger = console
  if (typeof logger === 'object') {
    loggerObject = logger
  } else if (typeof log === 'function') {
    loggerObject = {debug: log, info: log, warn: log, error: log}
  }
  return verbose
    ? loggerObject
    : {
      debug: undefined,
      info: loggerObject.info.bind(loggerObject),
      warn: loggerObject.warn.bind(loggerObject),
      error: loggerObject.error.bind(loggerObject),
    }
}

export default async (options: OptsWithMigs): Promise<RunMigration[]> => {
  const logger = getLogger(options)
  const db = Db((options as RunnerOptionClient).dbClient || (options as RunnerOptionUrl).databaseUrl, logger)
  try {
    await db.createConnection()

    if (!options.noLock) {
      await lock(db)
    }

    if (options.schema) {
      const schemas = getSchemas(options.schema)
      if (options.createSchema) {
        await Promise.all(schemas.map((schema) => db.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`)))
      }
      await db.query(`SET search_path TO ${schemas.map((s) => `"${s}"`).join(', ')}`)
    }
    if (options.migrationsSchema && options.createMigrationsSchema) {
      await db.query(`CREATE SCHEMA IF NOT EXISTS "${options.migrationsSchema}"`)
    }

    await ensureMigrationsTable(db, options)

    const [migrations, runNames] = await Promise.all([
      loadMigrations(db, options, logger),
      getRunMigrations(db, options),
    ])

    if (options.checkOrder) {
      checkOrder(runNames, migrations)
    }

    const toRun: Migration[] = getMigrationsToRun(options, runNames, migrations)

    if (!toRun.length) {
      logger.info('No migrations to run!')
      return []
    }

    // TODO: add some fancy colors to logging
    logger.info('> Migrating files:')
    toRun.forEach((m) => {
      logger.info(`> - ${m.name}`)
    })

    if (options.fake) {
      await runMigrations(toRun, 'markAsRun', options.direction)
    } else if (options.singleTransaction) {
      await db.query('BEGIN')
      try {
        await runMigrations(toRun, 'apply', options.direction)
        await db.query('COMMIT')
      } catch (err) {
        logger.warn('> Rolling back attempted migration ...')
        await db.query('ROLLBACK')
        throw err
      }
    } else {
      await runMigrations(toRun, 'apply', options.direction)
    }

    return toRun.map((m) => ({
      path: m.path,
      name: m.name,
      timestamp: m.timestamp,
    }))
  } finally {
    if (db.connected()) {
      if (!options.noLock) {
        await unlock(db).catch((error) => logger.warn(error.message))
      }
      db.close()
    }
  }
}
