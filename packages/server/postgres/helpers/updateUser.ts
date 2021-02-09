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
  'reasonRemoved',
  'newFeatureId',
  'identities'
])

const mapUpdates = (
  updates: Partial<User>
): IUpdateUserQueryParams => {
  const mapped = {}
  for (const f of updateableFields.values()) {
    if ((updates.hasOwnProperty(f))) {
      [mapped[f], mapped[`${f}Value`]] = [true, updates[f]]
    } else {
      [mapped[f], mapped[`${f}Value`]] = [false, null]
    }
  }
  return mapped as IUpdateUserQueryParams
}

const updateUser = (
  userId: string,
  updates: Partial<User>
) => {
  const pg = getPg()
  console.log('updates:', updates)
  const mappedUpdates = mapUpdates(updates)
  console.log('mapped updates:', mappedUpdates)
  const parameters = Object.assign(mappedUpdates, {id: userId})
  updateUserQuery.run(parameters, pg)
}

export default updateUser
