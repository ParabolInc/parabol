import User from '../../database/types/User'
import getRethink from '../../database/rethinkDriver'
import getUsersById, {IGetUsersByIdResult} from '../../postgres/queries/getUsersById'
import lodash from 'lodash'
import {EMAIL_LIMIT, PREFERRED_NAME_LIMIT} from '../constants/User'
import {CustomResolver, checkTableEq} from './checkEqBase'

const emailsAreEqual: CustomResolver = (rethinkEmail, pgEmail) =>
  lodash.isEqual(rethinkEmail, pgEmail) ||
  (rethinkEmail === 'DELETED' && pgEmail.startsWith('DELETED')) ||
  lodash.isEqual(rethinkEmail.slice(0, EMAIL_LIMIT), pgEmail)

const preferredNamesAreEqual: CustomResolver = (rethinkPreferredName, pgPreferredName) =>
  lodash.isEqual(rethinkPreferredName, pgPreferredName) ||
  lodash.isEqual(rethinkPreferredName.slice(0, PREFERRED_NAME_LIMIT), pgPreferredName)

const alwaysDefinedFieldsCustomResolvers = {
  email: emailsAreEqual,
  preferredName: preferredNamesAreEqual,
  updatedAt: undefined,
  picture: undefined,
  identities: undefined,
  createdAt: undefined,
  tier: undefined,
  tms: undefined
} as {
  [Property in keyof Partial<User>]: CustomResolver | undefined
}

/* if a field is allowed to be undefined in rethink,
 * what is its value in pg? */
const maybeUndefinedFieldsDefaultValues = {
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
} as {
  [Property in keyof Partial<User>]: any
}

const getPairNeFields = (rethinkUser: User, pgUser: IGetUsersByIdResult): string[] => {
  const neFields = [] as string[]

  for (const [f, customResolver] of Object.entries(alwaysDefinedFieldsCustomResolvers)) {
    const [rethinkValue, pgValue] = [rethinkUser[f], pgUser[f]]
    if (!lodash.isEqualWith(rethinkValue, pgValue, customResolver)) {
      neFields.push(f)
    }
  }
  for (const [f, defaultValue] of Object.entries(maybeUndefinedFieldsDefaultValues)) {
    const [rethinkValue, pgValue] = [rethinkUser[f], pgUser[f]]
    if (!lodash.isUndefined(rethinkValue)) {
      if (!lodash.isEqual(rethinkValue, pgValue)) {
        neFields.push(f)
      }
    } else {
      if (!lodash.isEqual(pgValue, defaultValue)) {
        neFields.push(f)
      }
    }
  }

  return neFields
}

const checkUserEq = async () => {
  const r = await getRethink()
  const rethinkQuery = r.table('User').orderBy('updatedAt', {index: 'updatedAt'})
  const errors = await checkTableEq<User, IGetUsersByIdResult>(
    rethinkQuery,
    getUsersById,
    getPairNeFields
  )
  return errors
}

export default checkUserEq
