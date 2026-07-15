import type {DataLoaderWorker} from '../../../graphql'

/**
 * Pure core. `row` semantics:
 * - null  → no secondaryStatusId was provided (valid: absent or explicit clear)
 * - undefined → an id was provided but no row was found (invalid)
 * - object → the loaded row to check against the task's team + primary status
 */
export const getSecondaryStatusValidationError = (
  row: {teamId: string; status: string} | null | undefined,
  teamId: string,
  status: string
) => {
  if (row === null) return undefined
  if (!row) return 'Secondary status not found'
  if (row.teamId !== teamId) return 'Secondary status belongs to a different team'
  if (row.status !== status) return 'Secondary status is nested under a different primary status'
  return undefined
}

export const validateTaskSecondaryStatus = async (
  secondaryStatusId: number | null | undefined,
  teamId: string,
  status: string,
  dataLoader: DataLoaderWorker
) => {
  if (secondaryStatusId == null) return getSecondaryStatusValidationError(null, teamId, status)
  if (Number.isNaN(secondaryStatusId)) {
    return getSecondaryStatusValidationError(undefined, teamId, status)
  }
  const row = await dataLoader.get('taskSecondaryStatuses').load(secondaryStatusId)
  return getSecondaryStatusValidationError(row ?? undefined, teamId, status)
}
