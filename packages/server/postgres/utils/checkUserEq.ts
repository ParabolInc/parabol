import User from '../../database/types/User'
import getRethink from '../../database/rethinkDriver'
import getUsersById, {IGetUsersByIdResult} from '../../postgres/queries/getUsersById'
import lodash from 'lodash'
import {EMAIL_LIMIT, PREFERRED_NAME_LIMIT} from '../constants/User'
import {
  CustomResolver,
  checkTableEq,
  AlwaysDefinedFieldsCustomResolvers,
  MaybeUndefinedFieldsCustomResolversDefaultValues
} from './checkEqBase'

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
} as AlwaysDefinedFieldsCustomResolvers<User>

/* if a field is allowed to be undefined in rethink,
 * what is its value in pg? */
const maybeUndefinedFieldsCustomResolversDefaultValues = {
  newFeatureId: [undefined, null],
  overLimitCopy: [undefined, null],
  segmentId: [undefined, null],
  reasonRemoved: [undefined, null],
  isRemoved: [undefined, false],
  payLaterClickCount: [undefined, 0],
  featureFlags: [undefined, []],
  lastSeenAt: [undefined, null],
  lastSeenAtURLs: [undefined, null],
  inactive: [undefined, false]
} as MaybeUndefinedFieldsCustomResolversDefaultValues<User>

const checkUserEq = async (pageSize = 3000, startPage = 0) => {
  const r = await getRethink()
  const rethinkQuery = r.table('User').orderBy('updatedAt', {index: 'updatedAt'})
  const errors = await checkTableEq<User, IGetUsersByIdResult>(
    rethinkQuery,
    getUsersById,
    alwaysDefinedFieldsCustomResolvers,
    maybeUndefinedFieldsCustomResolversDefaultValues,
    pageSize,
    startPage
  )
  return errors
}

export default checkUserEq
