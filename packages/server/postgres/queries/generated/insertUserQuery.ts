/** Types generated for queries found in "packages/server/postgres/queries/src/insertUserQuery.sql" */
import {PreparedQuery} from '@pgtyped/query'

export type TierEnum = 'personal' | 'pro' | 'enterprise'

export type stringArray = string[]

export type JsonArray = (null | boolean | number | string | Json[] | {[key: string]: Json})[]

/** 'InsertUserQuery' parameters type */
export interface IInsertUserQueryParams {
  id: string | null | void
  email: string | null | void
  createdAt: Date | null | void
  updatedAt: Date | null | void
  inactive: boolean | null | void
  lastSeenAt: Date | null | void
  preferredName: string | null | void
  tier: TierEnum | null | void
  picture: string | null | void
  tms: stringArray | null | void
  featureFlags: stringArray | null | void
  lastSeenAtURLs: stringArray | null | void
  segmentId: string | null | void
  identities: JsonArray | null | void
}

/** 'InsertUserQuery' return type */
export type IInsertUserQueryResult = void

/** 'InsertUserQuery' query type */
export interface IInsertUserQueryQuery {
  params: IInsertUserQueryParams
  result: IInsertUserQueryResult
}

const insertUserQueryIR: any = {
  name: 'insertUserQuery',
  params: [
    {
      name: 'id',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 264, b: 265, line: 20, col: 3}]}
    },
    {
      name: 'email',
      transform: {type: 'scalar'},
      codeRefs: {
        used: [
          {a: 271, b: 275, line: 21, col: 3},
          {a: 489, b: 493, line: 36, col: 11}
        ]
      }
    },
    {
      name: 'createdAt',
      transform: {type: 'scalar'},
      codeRefs: {
        used: [
          {a: 281, b: 289, line: 22, col: 3},
          {a: 513, b: 521, line: 37, col: 17}
        ]
      }
    },
    {
      name: 'updatedAt',
      transform: {type: 'scalar'},
      codeRefs: {
        used: [
          {a: 295, b: 303, line: 23, col: 3},
          {a: 541, b: 549, line: 38, col: 17}
        ]
      }
    },
    {
      name: 'inactive',
      transform: {type: 'scalar'},
      codeRefs: {
        used: [
          {a: 309, b: 316, line: 24, col: 3},
          {a: 566, b: 573, line: 39, col: 14}
        ]
      }
    },
    {
      name: 'lastSeenAt',
      transform: {type: 'scalar'},
      codeRefs: {
        used: [
          {a: 322, b: 331, line: 25, col: 3},
          {a: 594, b: 603, line: 40, col: 18}
        ]
      }
    },
    {
      name: 'preferredName',
      transform: {type: 'scalar'},
      codeRefs: {
        used: [
          {a: 337, b: 349, line: 26, col: 3},
          {a: 627, b: 639, line: 41, col: 21}
        ]
      }
    },
    {
      name: 'tier',
      transform: {type: 'scalar'},
      codeRefs: {
        used: [
          {a: 355, b: 358, line: 27, col: 3},
          {a: 652, b: 655, line: 42, col: 10}
        ]
      }
    },
    {
      name: 'picture',
      transform: {type: 'scalar'},
      codeRefs: {
        used: [
          {a: 364, b: 370, line: 28, col: 3},
          {a: 671, b: 677, line: 43, col: 13}
        ]
      }
    },
    {
      name: 'tms',
      transform: {type: 'scalar'},
      codeRefs: {
        used: [
          {a: 376, b: 378, line: 29, col: 3},
          {a: 689, b: 691, line: 44, col: 9}
        ]
      }
    },
    {
      name: 'featureFlags',
      transform: {type: 'scalar'},
      codeRefs: {
        used: [
          {a: 384, b: 395, line: 30, col: 3},
          {a: 714, b: 725, line: 45, col: 20}
        ]
      }
    },
    {
      name: 'lastSeenAtURLs',
      transform: {type: 'scalar'},
      codeRefs: {
        used: [
          {a: 401, b: 414, line: 31, col: 3},
          {a: 750, b: 763, line: 46, col: 22}
        ]
      }
    },
    {
      name: 'segmentId',
      transform: {type: 'scalar'},
      codeRefs: {
        used: [
          {a: 420, b: 428, line: 32, col: 3},
          {a: 783, b: 791, line: 47, col: 17}
        ]
      }
    },
    {
      name: 'identities',
      transform: {type: 'scalar'},
      codeRefs: {
        used: [
          {a: 434, b: 443, line: 33, col: 3},
          {a: 810, b: 819, line: 48, col: 16}
        ]
      }
    }
  ],
  usedParamSet: {
    id: true,
    email: true,
    createdAt: true,
    updatedAt: true,
    inactive: true,
    lastSeenAt: true,
    preferredName: true,
    tier: true,
    picture: true,
    tms: true,
    featureFlags: true,
    lastSeenAtURLs: true,
    segmentId: true,
    identities: true
  },
  statement: {
    body:
      'INSERT INTO "User" (\n  "id",\n  "email",\n  "createdAt", \n  "updatedAt",\n  "inactive",\n  "lastSeenAt",\n  "preferredName",\n  "tier",\n  "picture",\n  "tms",\n  "featureFlags",\n  "lastSeenAtURLs",\n  "segmentId",\n  "identities"\n) VALUES (\n  :id,\n  :email,\n  :createdAt,\n  :updatedAt,\n  :inactive,\n  :lastSeenAt,\n  :preferredName,\n  :tier,\n  :picture,\n  :tms,\n  :featureFlags,\n  :lastSeenAtURLs,\n  :segmentId,\n  :identities\n)\nON CONFLICT (id) DO UPDATE SET\n  email = :email,\n  "createdAt" = :createdAt,\n  "updatedAt" = :updatedAt,\n  inactive = :inactive,\n  "lastSeenAt" = :lastSeenAt,\n  "preferredName" = :preferredName,\n  tier = :tier,\n  picture = :picture,\n  tms = :tms,\n  "featureFlags" = :featureFlags,\n  "lastSeenAtURLs" = :lastSeenAtURLs,\n  "segmentId" = :segmentId,\n  identities = :identities,\n  "newFeatureId" = DEFAULT,\n  "overLimitCopy" = DEFAULT,\n  "isRemoved" = DEFAULT,\n  "reasonRemoved" = DEFAULT,\n  rol = DEFAULT,\n  "payLaterClickCount" = DEFAULT',
    loc: {a: 30, b: 981, line: 4, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "User" (
 *   "id",
 *   "email",
 *   "createdAt",
 *   "updatedAt",
 *   "inactive",
 *   "lastSeenAt",
 *   "preferredName",
 *   "tier",
 *   "picture",
 *   "tms",
 *   "featureFlags",
 *   "lastSeenAtURLs",
 *   "segmentId",
 *   "identities"
 * ) VALUES (
 *   :id,
 *   :email,
 *   :createdAt,
 *   :updatedAt,
 *   :inactive,
 *   :lastSeenAt,
 *   :preferredName,
 *   :tier,
 *   :picture,
 *   :tms,
 *   :featureFlags,
 *   :lastSeenAtURLs,
 *   :segmentId,
 *   :identities
 * )
 * ON CONFLICT (id) DO UPDATE SET
 *   email = :email,
 *   "createdAt" = :createdAt,
 *   "updatedAt" = :updatedAt,
 *   inactive = :inactive,
 *   "lastSeenAt" = :lastSeenAt,
 *   "preferredName" = :preferredName,
 *   tier = :tier,
 *   picture = :picture,
 *   tms = :tms,
 *   "featureFlags" = :featureFlags,
 *   "lastSeenAtURLs" = :lastSeenAtURLs,
 *   "segmentId" = :segmentId,
 *   identities = :identities,
 *   "newFeatureId" = DEFAULT,
 *   "overLimitCopy" = DEFAULT,
 *   "isRemoved" = DEFAULT,
 *   "reasonRemoved" = DEFAULT,
 *   rol = DEFAULT,
 *   "payLaterClickCount" = DEFAULT
 * ```
 */
export const insertUserQuery = new PreparedQuery<IInsertUserQueryParams, IInsertUserQueryResult>(
  insertUserQueryIR
)
