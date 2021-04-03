import User from '../../database/types/User'
import getRethink from '../../database/rethinkDriver'
import {
  getUsersByIdQuery,
  IGetUsersByIdQueryResult
} from '../../postgres/queries/generated/getUsersByIdQuery'
import getPg from '../../postgres/getPg'
import lodash from 'lodash'

const vanillaFields = [
  'preferredName',
  'email',
  'featureFlags',
  'lastSeenAt',
  'lastSeenAtURLs',
  'updatedAt',
  'picture',
  'inactive',
  'identities',
  'createdAt',
  'tier',
  'tms'
]

/* if a field is allowed to be undefined in rethink,
 * what is its value in pg? */
const maybeUndefinedFieldsDefaultValues = {
  newFeatureId: null,
  overLimitCopy: null,
  segmentId: null,
  reasonRemoved: null,
  isRemoved: false,
  payLaterClickCount: 0
}

interface IError {
  [key: string]: {
    error: string | string[]
    rethinkUser: User
    pgUser: IGetUsersByIdQueryResult
  }
}

// MUTATIVE
const addNeFieldToErrors = (
  errors: IError,
  neField: string,
  rethinkUser: User,
  pgUser: IGetUsersByIdQueryResult
) => {
  const prevNeFields = errors[rethinkUser.id]?.error ?? []
  errors[rethinkUser.id] = {
    error: [...prevNeFields, neField],
    rethinkUser,
    pgUser
  }
}

const checkPair = async (rethinkUser: User, pgUser: IGetUsersByIdQueryResult, errors: IError) => {
  for (const f of vanillaFields) {
    const [rethinkValue, pgValue] = [rethinkUser[f], pgUser[f]]
    if (!lodash.isEqual(rethinkValue, pgValue)) {
      addNeFieldToErrors(errors, f, rethinkUser, pgUser)
    }
  }
  for (const [f, defaultValue] of Object.entries(maybeUndefinedFieldsDefaultValues)) {
    const [rethinkValue, pgValue] = [rethinkUser[f], pgUser[f]]
    if (!lodash.isUndefined(rethinkValue)) {
      if (!lodash.isEqual(rethinkValue, pgValue)) {
        addNeFieldToErrors(errors, f, rethinkUser, pgUser)
      }
    } else {
      if (!lodash.isEqual(pgValue, defaultValue)) {
        addNeFieldToErrors(errors, f, rethinkUser, pgUser)
      }
    }
  }
}

const checkUserEq = async (): Promise<IError> => {
  const errors = {}
  const batchSize = 3000
  const r = await getRethink()

  for (let i = 0; i < 1e5; i++) {
    console.log(i)
    const offset = batchSize * i
    const rethinkUsers = await r
      .table('User')
      .orderBy('updatedAt', {index: 'updatedAt'})
      .skip(offset)
      .limit(batchSize)
      .run()
    if (!rethinkUsers.length) {
      break
    }

    const userIds = rethinkUsers.map((u) => u.id)
    console.log('user ids length:', userIds.length)
    const pgUsers = await getUsersByIdQuery.run({ids: userIds}, getPg())
    console.log('pg users length:', pgUsers.length)
    const pgUsersById = {} as {
      [key: string]: IGetUsersByIdQueryResult
    }
    pgUsers.forEach((pgUser) => {
      pgUsersById[pgUser.id] = pgUser
    })

    for (const rethinkUser of rethinkUsers) {
      const pgUser = pgUsersById[rethinkUser.id]
      if (!pgUser) {
        errors[rethinkUser.id] = {
          error: 'No pg user found for rethink user',
          rethinkUser: rethinkUser
        }
        continue
      }
      await checkPair(rethinkUser, pgUser, errors)
    }
  }
  return errors
}

export default checkUserEq
