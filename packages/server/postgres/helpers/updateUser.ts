import {updateUserQuery, IUpdateUserQueryParams} from '../queries/generated/updateUserQuery'
import getPg from '../getPg'
import User from '../../database/types/User'

const passableFields = new Set([
  'email',
  'updatedAt',
  'inactive',
  'lastSeenAt',
  'preferredName',
  'tier',
  'picture',
  'segmentId',
  'isRemoved',
  'reasonRemoved',
  'newFeatureId',
  'identities',
  'overLimitCopy',
  'id'
])

const mapUpdates = (
  updates: Partial<User>
): IUpdateUserQueryParams => {
  const mapped = {}
  for (const f of passableFields.values()) {
    [mapped[f], mapped[`${f}Value`]] = (
      (updates.hasOwnProperty(f))
    ) ? [true, updates[f]] : [false, null]
  }
  return mapped as IUpdateUserQueryParams
}

const updateUser = (
  updates: Partial<User>,
  userIds?: string[] | string,
): Promise<void[]> => {
  const pg = getPg()
  userIds = (typeof userIds === 'string') ? [userIds] : userIds
  if (userIds) { Object.assign(updates, {id: userIds}) }
  const mappedUpdates = mapUpdates(updates)
  return updateUserQuery.run(mappedUpdates, pg)
}

export default updateUser
