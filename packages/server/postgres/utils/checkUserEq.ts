import getRethink from '../../database/rethinkDriver'
import User from '../../database/types/User'
import {getUsersByIds} from '../queries/getUsersByIds'
import {checkTableEq} from './checkEqBase'

const alwaysDefinedFields: (keyof Partial<User>)[] = [
  'email',
  'preferredName',
  'updatedAt',
  'picture',
  'identities',
  'createdAt',
  'tier',
  'tms'
]

/* if a field is allowed to be undefined in rethink,
 * what is its value in pg? */
const maybeUndefinedFieldsDefaultValues: {[Property in keyof Partial<User>]: any} = {
  newFeatureId: null,
  overLimitCopy: null,
  segmentId: null,
  reasonRemoved: null,
  isRemoved: false,
  payLaterClickCount: 0,
  featureFlags: [],
  lastSeenAt: null,
  lastSeenAtURLs: null,
  inactive: false
}

/**
 * if a field is explicitly null in RethinkDB,
 * what value in PG should we expect?
 */
const maybeNullFieldsDefaultValues: {[Property in keyof Partial<User>]: any} = {
  overLimitCopy: ''
}

const checkUserEq = async (maxErrors = 10) => {
  const r = await getRethink()
  const rethinkQuery = r.table('User').orderBy('updatedAt', {index: 'updatedAt'})
  const errors = await checkTableEq(
    'User',
    rethinkQuery,
    getUsersByIds,
    alwaysDefinedFields,
    maybeUndefinedFieldsDefaultValues,
    maybeNullFieldsDefaultValues,
    maxErrors
  )
  return errors
}

export default checkUserEq
