import User from '../../database/types/User'
import getRethink from '../../database/rethinkDriver'
import getUsersById from '../../postgres/queries/getUsersById'
import {checkTableEq} from './checkEqBase'

const alwaysDefinedFields :
  (keyof Partial<User>)[] = 
[
  'email',
  'preferredName',
  'updatedAt',
  'picture',
  'identities',
  'createdAt',
  'tier',
  'tms',
]

/* if a field is allowed to be undefined in rethink,
 * what is its value in pg? */
const maybeUndefinedFieldsDefaultValues : 
  {[Property in keyof Partial<User>]: any} = 
{
  newFeatureId: null,
  overLimitCopy: null,
  segmentId: null,
  reasonRemoved: null,
  isRemoved: false,
  payLaterClickCount: 0,
  featureFlags: [],
  lastSeenAt: null,
  lastSeenAtURLs: null,
  inactive: false,
}

const checkUserEq = async (maxErrors: number = 10) => {
  const r = await getRethink()
  const rethinkQuery = r
    .table('User').orderBy('updatedAt', {index: 'updatedAt'})
  const errors = await checkTableEq(
    rethinkQuery,
    getUsersById,
    alwaysDefinedFields,
    maybeUndefinedFieldsDefaultValues,
    maxErrors
  )
  return errors
}

export default checkUserEq
