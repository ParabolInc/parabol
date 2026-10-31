export type MigrationPlan = {type: 'migrate'} | {type: 'skip'; newerMigrationNames: string[]}

// A database that is ahead of this build means a rollback: a newer build already migrated it,
// and expand/contract migrations keep older builds working against that schema.
// Any other mismatch is left for kysely to reject.
export const getMigrationPlan = (
  shippedMigrationNames: string[],
  appliedMigrationNames: string[]
): MigrationPlan => {
  const shippedNames = new Set(shippedMigrationNames)
  const unshippedMigrationNames = appliedMigrationNames.filter((name) => !shippedNames.has(name))
  if (unshippedMigrationNames.length === 0) return {type: 'migrate'}
  const appliedNames = new Set(appliedMigrationNames)
  const hasPendingMigrations = shippedMigrationNames.some((name) => !appliedNames.has(name))
  if (hasPendingMigrations) return {type: 'migrate'}
  const newestShippedName = shippedMigrationNames.toSorted().at(-1) ?? ''
  const isDatabaseAhead = unshippedMigrationNames.every((name) => name > newestShippedName)
  return isDatabaseAhead
    ? {type: 'skip', newerMigrationNames: unshippedMigrationNames}
    : {type: 'migrate'}
}
