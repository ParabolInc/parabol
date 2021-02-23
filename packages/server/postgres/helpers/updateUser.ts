import {updateUserQuery, IUpdateUserQueryParams} from '../queries/generated/updateUserQuery'
import getPg from '../getPg'
import User from '../../database/types/User'
import prepareJson from '../utils/prepareJson'

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
  'overLimitCopy'
])

const mapUpdates = (updates: Partial<User>): IUpdateUserQueryParams => {
  const mapped = {}
  for (const f of passableFields.values()) {
    ;[mapped[f], mapped[`${f}Value`]] = updates.hasOwnProperty(f)
      ? [true, updates[f]]
      : [false, null]
  }
  return mapped as IUpdateUserQueryParams
}

const updateUser = (updates: Partial<User>, userIds: string[] | string): Promise<void[]> => {
  const mappedUpdates = mapUpdates(updates)
  userIds = typeof userIds === 'string' ? [userIds] : userIds
  Object.assign(mappedUpdates, {ids: userIds})
  mappedUpdates.identitiesValue = mappedUpdates.identities
    ? prepareJson(mappedUpdates.identitiesValue)
    : mappedUpdates.identitiesValue
  return updateUserQuery.run(mappedUpdates, getPg())
}

export default updateUser
