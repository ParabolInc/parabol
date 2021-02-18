/** Types generated for queries found in "packages/server/postgres/queries/src/updateUserQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type TierEnum = 'personal' | 'pro' | 'enterprise'

export type JsonArray = (null | boolean | number | string | Json[] | {[key: string]: Json})[]

/** 'UpdateUserQuery' parameters type */
export interface IUpdateUserQueryParams {
  ids: Array<string | null | void>
  email: boolean | null | void
  emailValue: string | null | void
  updatedAt: boolean | null | void
  updatedAtValue: Date | null | void
  inactive: boolean | null | void
  inactiveValue: boolean | null | void
  lastSeenAt: boolean | null | void
  lastSeenAtValue: Date | null | void
  preferredName: boolean | null | void
  preferredNameValue: string | null | void
  tier: boolean | null | void
  tierValue: TierEnum | null | void
  picture: boolean | null | void
  pictureValue: string | null | void
  segmentId: boolean | null | void
  segmentIdValue: string | null | void
  isRemoved: boolean | null | void
  isRemovedValue: boolean | null | void
  reasonRemoved: boolean | null | void
  reasonRemovedValue: string | null | void
  newFeatureId: boolean | null | void
  newFeatureIdValue: string | null | void
  identities: boolean | null | void
  identitiesValue: JsonArray | null | void
  overLimitCopy: boolean | null | void
  overLimitCopyValue: string | null | void
}

/** 'UpdateUserQuery' return type */
export type IUpdateUserQueryResult = void

/** 'UpdateUserQuery' query type */
export interface IUpdateUserQueryQuery {
  params: IUpdateUserQueryParams
  result: IUpdateUserQueryResult
}

const updateUserQueryIR: any = {
  name: 'updateUserQuery',
  params: [
    {
      name: 'update',
      codeRefs: {defined: {a: 36, b: 41, line: 3, col: 9}, used: []},
      transform: {
        type: 'pick_tuple',
        keys: [
          'email',
          'emailValue',
          'updatedAt',
          'updatedAtValue',
          'inactive',
          'inactiveValue',
          'lastSeenAt',
          'lastSeenAtValue',
          'preferredName',
          'preferredNameValue',
          'tier',
          'tierValue',
          'picture',
          'pictureValue',
          'segmentId',
          'segmentIdValue',
          'isRemoved',
          'isRemovedValue',
          'reasonRemoved',
          'reasonRemovedValue',
          'newFeatureId',
          'newFeatureIdValue',
          'identities',
          'identitiesValue',
          'overLimitCopy',
          'overLimitCopyValue'
        ]
      }
    },
    {
      name: 'ids',
      codeRefs: {
        defined: {a: 525, b: 527, line: 31, col: 9},
        used: [{a: 1615, b: 1617, line: 47, col: 13}]
      },
      transform: {type: 'array_spread'}
    },
    {
      name: 'email',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 580, b: 584, line: 34, col: 21}]}
    },
    {
      name: 'emailValue',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 592, b: 601, line: 34, col: 33}]}
    },
    {
      name: 'updatedAt',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 646, b: 654, line: 35, col: 27}]}
    },
    {
      name: 'updatedAtValue',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 662, b: 675, line: 35, col: 43}]}
    },
    {
      name: 'inactive',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 723, b: 730, line: 36, col: 24}]}
    },
    {
      name: 'inactiveValue',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 738, b: 750, line: 36, col: 39}]}
    },
    {
      name: 'lastSeenAt',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 799, b: 808, line: 37, col: 28}]}
    },
    {
      name: 'lastSeenAtValue',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 816, b: 830, line: 37, col: 45}]}
    },
    {
      name: 'preferredName',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 886, b: 898, line: 38, col: 31}]}
    },
    {
      name: 'preferredNameValue',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 906, b: 923, line: 38, col: 51}]}
    },
    {
      name: 'tier',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 971, b: 974, line: 39, col: 20}]}
    },
    {
      name: 'tierValue',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 982, b: 990, line: 39, col: 31}]}
    },
    {
      name: 'picture',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 1030, b: 1036, line: 40, col: 23}]}
    },
    {
      name: 'pictureValue',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 1044, b: 1055, line: 40, col: 37}]}
    },
    {
      name: 'segmentId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 1102, b: 1110, line: 41, col: 27}]}
    },
    {
      name: 'segmentIdValue',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 1118, b: 1131, line: 41, col: 43}]}
    },
    {
      name: 'isRemoved',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 1182, b: 1190, line: 42, col: 27}]}
    },
    {
      name: 'isRemovedValue',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 1198, b: 1211, line: 42, col: 43}]}
    },
    {
      name: 'reasonRemoved',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 1266, b: 1278, line: 43, col: 31}]}
    },
    {
      name: 'reasonRemovedValue',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 1286, b: 1303, line: 43, col: 51}]}
    },
    {
      name: 'newFeatureId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 1361, b: 1372, line: 44, col: 30}]}
    },
    {
      name: 'newFeatureIdValue',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 1380, b: 1396, line: 44, col: 49}]}
    },
    {
      name: 'identities',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 1451, b: 1460, line: 45, col: 28}]}
    },
    {
      name: 'identitiesValue',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 1468, b: 1482, line: 45, col: 45}]}
    },
    {
      name: 'overLimitCopy',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 1538, b: 1550, line: 46, col: 31}]}
    },
    {
      name: 'overLimitCopyValue',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 1558, b: 1575, line: 46, col: 51}]}
    }
  ],
  usedParamSet: {
    email: true,
    emailValue: true,
    updatedAt: true,
    updatedAtValue: true,
    inactive: true,
    inactiveValue: true,
    lastSeenAt: true,
    lastSeenAtValue: true,
    preferredName: true,
    preferredNameValue: true,
    tier: true,
    tierValue: true,
    picture: true,
    pictureValue: true,
    segmentId: true,
    segmentIdValue: true,
    isRemoved: true,
    isRemovedValue: true,
    reasonRemoved: true,
    reasonRemovedValue: true,
    newFeatureId: true,
    newFeatureIdValue: true,
    identities: true,
    identitiesValue: true,
    overLimitCopy: true,
    overLimitCopyValue: true,
    ids: true
  },
  statement: {
    body:
      'UPDATE "User" SET\n  email = CASE WHEN :email THEN :emailValue ELSE email END,\n  "updatedAt" = CASE WHEN :updatedAt THEN :updatedAtValue ELSE "updatedAt" END,\n  inactive = CASE WHEN :inactive THEN :inactiveValue ELSE inactive END,\n  "lastSeenAt" = CASE WHEN :lastSeenAt THEN :lastSeenAtValue ELSE "lastSeenAt" END,\n  "preferredName" = CASE WHEN :preferredName THEN :preferredNameValue ELSE "preferredName" END,\n  tier = CASE WHEN :tier THEN :tierValue ELSE tier END,\n  picture = CASE WHEN :picture THEN :pictureValue ELSE picture END,\n  "segmentId" = CASE WHEN :segmentId THEN :segmentIdValue ELSE "segmentId" END,\n  "isRemoved" = CASE WHEN :isRemoved THEN :isRemovedValue ELSE "isRemoved" END,\n  "reasonRemoved" = CASE WHEN :reasonRemoved THEN :reasonRemovedValue ELSE "reasonRemoved" END,\n  "newFeatureId" = CASE WHEN :newFeatureId THEN :newFeatureIdValue ELSE "newFeatureId" END,\n  "identities" = CASE WHEN :identities THEN :identitiesValue ELSE "identities" END,\n  "overLimitCopy" = CASE WHEN :overLimitCopy THEN :overLimitCopyValue ELSE "overLimitCopy" END\nWHERE id IN :ids',
    loc: {a: 541, b: 1617, line: 33, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE "User" SET
 *   email = CASE WHEN :email THEN :emailValue ELSE email END,
 *   "updatedAt" = CASE WHEN :updatedAt THEN :updatedAtValue ELSE "updatedAt" END,
 *   inactive = CASE WHEN :inactive THEN :inactiveValue ELSE inactive END,
 *   "lastSeenAt" = CASE WHEN :lastSeenAt THEN :lastSeenAtValue ELSE "lastSeenAt" END,
 *   "preferredName" = CASE WHEN :preferredName THEN :preferredNameValue ELSE "preferredName" END,
 *   tier = CASE WHEN :tier THEN :tierValue ELSE tier END,
 *   picture = CASE WHEN :picture THEN :pictureValue ELSE picture END,
 *   "segmentId" = CASE WHEN :segmentId THEN :segmentIdValue ELSE "segmentId" END,
 *   "isRemoved" = CASE WHEN :isRemoved THEN :isRemovedValue ELSE "isRemoved" END,
 *   "reasonRemoved" = CASE WHEN :reasonRemoved THEN :reasonRemovedValue ELSE "reasonRemoved" END,
 *   "newFeatureId" = CASE WHEN :newFeatureId THEN :newFeatureIdValue ELSE "newFeatureId" END,
 *   "identities" = CASE WHEN :identities THEN :identitiesValue ELSE "identities" END,
 *   "overLimitCopy" = CASE WHEN :overLimitCopy THEN :overLimitCopyValue ELSE "overLimitCopy" END
 * WHERE id IN :ids
 * ```
 */
export const updateUserQuery = new PreparedQuery<IUpdateUserQueryParams, IUpdateUserQueryResult>(
  updateUserQueryIR
)
