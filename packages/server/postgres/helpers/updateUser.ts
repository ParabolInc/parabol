import {updateUserQuery, IUpdateUserQueryParams} from '../queries/generated/updateUserQuery'
import getPg from '../getPg'
import User from '../../database/types/User'

const updateableFields = new Set([
  'email',
  'updatedAt',
  'inactive',
  'lastSeenAt',
  'preferredName',
  'tier',
  'picture',
  'segmentId',
  'isRemoved',
  'reasonRemoved'
])

const mapUndefined = (
  updates: Partial<User>
): IUpdateUserQueryParams => {
  const mapped = {}
  for (const f of updateableFields.values()) {
    mapped[f] = (updates.hasOwnProperty(f)) ? updates[f] : null
  }
  return mapped as IUpdateUserQueryParams
}

const updateUser = (
  userId: string,
  updates: Partial<User>
) => {
  const pg = getPg()
  console.log('updates:', updates)
  const mappedUpdates = mapUndefined(updates)
  console.log('mapped updates:', mappedUpdates)
  const parameters = Object.assign(mappedUpdates, {id: userId})
  updateUserQuery.run(parameters, pg)
}

export default updateUser
