import User from '../../database/types/User'
import getRethink from '../../database/rethinkDriver'
import {
  getUsersByIdQuery,
  IGetUsersByIdQueryResult
} from '../../postgres/queries/generated/getUsersByIdQuery'
import getPg from '../../postgres/getPg'
import lodash from 'lodash'
import {EMAIL_LIMIT, PREFERRED_NAME_LIMIT} from '../constants/User'

const emailsAreEqual = (
  rethinkEmail: string,
  pgEmail: string
): boolean => (
  lodash.isEqual(rethinkEmail, pgEmail) ||
    (rethinkEmail === 'DELETED' && pgEmail.startsWith('DELETED'))
)

const alwaysDefinedFieldsCustomResolvers = {
  email: emailsAreEqual,
  preferredName: undefined,
  updatedAt: undefined,
  picture: undefined,
  identities: undefined,
  createdAt: undefined,
  tier: undefined,
  tms: undefined
} as {
  [key: string]: ((rethinkValue: string, pgValue: string) => boolean) | undefined
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
}

interface IErrorEntry {
  error: string | string[]
  rethinkUser?: Partial<User>
  pgUser?: Partial<IGetUsersByIdQueryResult>
}

interface IError {
  [key: string]: IErrorEntry
}

// MUTATIVE
const addNeFieldToErrors = (
  errors: IError,
  neField: string,
  rethinkUser: User,
  pgUser: IGetUsersByIdQueryResult
) => {
  const userId = rethinkUser.id
  const prevErrorEntry = errors[userId] ?? {
    error: [],
    rethinkUser: {},
    pgUser: {}
  } as IErrorEntry
  errors[userId] = {
    error: [
      ...prevErrorEntry.error,
      neField
    ],
    rethinkUser: {
      ...prevErrorEntry.rethinkUser,
      [neField]: rethinkUser[neField]
    },
    pgUser: {
      ...prevErrorEntry.pgUser,
      [neField]: pgUser[neField]
    }
  }
}

const checkPair = async (rethinkUser: User, pgUser: IGetUsersByIdQueryResult, errors: IError) => {
  for (const [f, customResolver] of Object.entries(alwaysDefinedFieldsCustomResolvers)) {
    const [rethinkValue, pgValue] = [rethinkUser[f], pgUser[f]]
    if (!lodash.isEqualWith(rethinkValue, pgValue, customResolver)) {
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
      .filter(row =>
        (row('email').count() as any).le(
          EMAIL_LIMIT
        ).and(
          (row('preferredName').count() as any).le(
            PREFERRED_NAME_LIMIT
          )
        )
      )
      .run()
    if (!rethinkUsers.length) {
      break
    }

    const userIds = rethinkUsers.map((u) => u.id)
    const pgUsers = await getUsersByIdQuery.run({ids: userIds}, getPg())
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
        }
        continue
      }
      await checkPair(rethinkUser, pgUser, errors)
    }
  }
  return errors
}

export default checkUserEq
