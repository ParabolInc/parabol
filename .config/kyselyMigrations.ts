// kysely-ctl does some weird esbuild stuff so we can't bundle it, so we extract this object from it
// so kysely.config.ts is not required by the bundle, only in dev

export const migrations = {
  // Uncomment this if you need to fix your local DB migration order!
  // allowUnorderedMigrations: true,
  getMigrationPrefix: () => `${new Date().toISOString()}_`,
  migrationFolder: './packages/server/postgres/migrations',
  migrationTableSchema: 'public',
  migrationTableName: '_migrationV2',
  migrationLockTableName: '_migrationLock'
}
