// kysely-ctl does some weird esbuild stuff so we can't bundle it, so we extract this object from it
// so kysely.config.ts is not required by the bundle, only in dev

export const migrations = {
  // each migration commits on its own, so a migration may use anything an earlier one
  // created — e.g. an enum value added via `ALTER TYPE ... ADD VALUE`, which pg forbids
  // using in the transaction that added it. The tradeoff is that a batch that fails
  // partway leaves the earlier migrations applied, so migrations must be independently
  // safe to leave in place & fixed forward
  transactionMode: 'per-migration',
  // Uncomment this if you need to fix your local DB migration order!
  // allowUnorderedMigrations: true,
  getMigrationPrefix: () => `${new Date().toISOString()}_`,
  migrationFolder: './packages/server/postgres/migrations',
  migrationTableSchema: 'public',
  migrationTableName: '_migrationV2',
  migrationLockTableName: '_migrationLock'
}
