// DO NOT TOUCH
// In the past, we wrote some migrations that relied on generated files
// This was wrong. A migration file should never depend on something generated or something that could change in the future
// In order to remove those generated files but still be able to run the migration, we moved all the used ones here

import {PreparedQuery} from '@pgtyped/query'
import getPg from './getPg'

const getTemplateRefsByIdsQueryIR: any = {
  name: 'getTemplateRefsByIdsQuery',
  params: [
    {
      name: 'ids',
      codeRefs: {
        defined: {a: 46, b: 48, line: 3, col: 9},
        used: [{a: 226, b: 228, line: 7, col: 17}]
      },
      transform: {type: 'array_spread'}
    }
  ],
  usedParamSet: {ids: true},
  statement: {
    body: 'SELECT t."id", t."createdAt", s."name", s."dimensions"\nFROM "TemplateRef" as t, jsonb_to_record(t."template") as s("name" text, "dimensions" json)\nWHERE t."id" in :ids',
    loc: {a: 62, b: 228, line: 5, col: 0}
  }
}

const getTemplateRefsByIdsQuery = new PreparedQuery(getTemplateRefsByIdsQueryIR)

export const getTemplateRefsByIds = async (ids: any) => {
  const templateRefs = await getTemplateRefsByIdsQuery.run({ids} as any, getPg())
  return templateRefs as any
}

const insertTaskEstimateQueryIR: any = {
  name: 'insertTaskEstimateQuery',
  params: [
    {
      name: 'changeSource',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 253, b: 264, line: 17, col: 3}]}
    },
    {
      name: 'name',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 270, b: 273, line: 18, col: 3}]}
    },
    {
      name: 'label',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 279, b: 283, line: 19, col: 3}]}
    },
    {
      name: 'taskId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 289, b: 294, line: 20, col: 3}]}
    },
    {
      name: 'userId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 300, b: 305, line: 21, col: 3}]}
    },
    {
      name: 'meetingId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 311, b: 319, line: 22, col: 3}]}
    },
    {
      name: 'stageId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 325, b: 331, line: 23, col: 3}]}
    },
    {
      name: 'discussionId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 337, b: 348, line: 24, col: 3}]}
    },
    {
      name: 'jiraFieldId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 354, b: 364, line: 25, col: 3}]}
    },
    {
      name: 'githubLabelName',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 370, b: 384, line: 26, col: 3}]}
    },
    {
      name: 'azureDevOpsFieldName',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 390, b: 409, line: 27, col: 3}]}
    }
  ],
  usedParamSet: {
    changeSource: true,
    name: true,
    label: true,
    taskId: true,
    userId: true,
    meetingId: true,
    stageId: true,
    discussionId: true,
    jiraFieldId: true,
    githubLabelName: true,
    azureDevOpsFieldName: true
  },
  statement: {
    body: 'INSERT INTO "TaskEstimate" (\n  "changeSource",\n  "name",\n  "label",\n  "taskId",\n  "userId",\n  "meetingId",\n  "stageId",\n  "discussionId",\n  "jiraFieldId",\n  "githubLabelName",\n  "azureDevOpsFieldName"\n) VALUES (\n  :changeSource,\n  :name,\n  :label,\n  :taskId,\n  :userId,\n  :meetingId,\n  :stageId,\n  :discussionId,\n  :jiraFieldId,\n  :githubLabelName,\n  :azureDevOpsFieldName\n)',
    loc: {a: 38, b: 411, line: 4, col: 0}
  }
}

const insertTaskEstimateQuery = new PreparedQuery(insertTaskEstimateQueryIR)

export const insertTaskEstimate = async (estimate: any) => {
  await insertTaskEstimateQuery.run(estimate as any, getPg())
}

const backupUserQueryIR: any = {
  name: 'backupUserQuery',
  params: [
    {
      name: 'users',
      codeRefs: {
        defined: {a: 36, b: 40, line: 3, col: 9},
        used: [{a: 738, b: 742, line: 47, col: 12}]
      },
      transform: {
        type: 'pick_array_spread',
        keys: [
          'id',
          'email',
          'createdAt',
          'updatedAt',
          'inactive',
          'lastSeenAt',
          'preferredName',
          'tier',
          'picture',
          'tms',
          'featureFlags',
          'lastSeenAtURLs',
          'identities',
          'segmentId',
          'newFeatureId',
          'overLimitCopy',
          'isRemoved',
          'reasonRemoved',
          'rol',
          'payLaterClickCount'
        ]
      }
    }
  ],
  usedParamSet: {users: true},
  statement: {
    body: 'INSERT INTO "User" (\n    "id",\n    "email",\n    "createdAt",\n    "updatedAt",\n    "inactive",\n    "lastSeenAt",\n    "preferredName",\n    "tier",\n    "picture",\n    "tms",\n    "featureFlags",\n    "lastSeenAtURLs",\n    "identities",\n    "segmentId",\n    "newFeatureId",\n    "overLimitCopy",\n    "isRemoved",\n    "reasonRemoved",\n    "rol",\n    "payLaterClickCount"\n  ) VALUES :users\n  ON CONFLICT (id) DO UPDATE SET\n    "email" = EXCLUDED."email",\n    "createdAt" = EXCLUDED."createdAt",\n    "updatedAt" = EXCLUDED."updatedAt",\n    "inactive" = EXCLUDED."inactive",\n    "lastSeenAt" = EXCLUDED."lastSeenAt",\n    "preferredName" = EXCLUDED."preferredName",\n    "tier" = EXCLUDED."tier",\n    "picture" = EXCLUDED."picture",\n    "tms" = EXCLUDED."tms",\n    "featureFlags" = EXCLUDED."featureFlags",\n    "lastSeenAtURLs" = EXCLUDED."lastSeenAtURLs",\n    "identities" = EXCLUDED."identities",\n    "segmentId" = EXCLUDED."segmentId",\n    "newFeatureId" = EXCLUDED."newFeatureId",\n    "overLimitCopy" = EXCLUDED."overLimitCopy",\n    "isRemoved" = EXCLUDED."isRemoved",\n    "reasonRemoved" = EXCLUDED."reasonRemoved",\n    "rol" = EXCLUDED."rol",\n    "payLaterClickCount" = EXCLUDED."payLaterClickCount"',
    loc: {a: 363, b: 1554, line: 26, col: 2}
  }
}
export const backupUserQuery = new PreparedQuery(backupUserQueryIR)

const backupTeamQueryIR: any = {
  name: 'backupTeamQuery',
  params: [
    {
      name: 'teams',
      codeRefs: {
        defined: {a: 36, b: 40, line: 3, col: 9},
        used: [{a: 466, b: 470, line: 31, col: 10}]
      },
      transform: {
        type: 'pick_array_spread',
        keys: [
          'id',
          'name',
          'createdAt',
          'createdBy',
          'isArchived',
          'isPaid',
          'jiraDimensionFields',
          'lastMeetingType',
          'tier',
          'orgId',
          'isOnboardTeam',
          'updatedAt'
        ]
      }
    }
  ],
  usedParamSet: {teams: true},
  statement: {
    body: 'INSERT INTO "Team" (\n    "id",\n    "name",\n    "createdAt",\n    "createdBy",\n    "isArchived",\n    "isPaid",\n    "jiraDimensionFields",\n    "lastMeetingType",\n    "tier",\n    "orgId",\n    "isOnboardTeam",\n    "updatedAt"\n) VALUES :teams\nON CONFLICT (id) DO UPDATE SET\n  "name" = EXCLUDED."name",\n  "createdAt" = EXCLUDED."createdAt",\n  "createdBy" = EXCLUDED."createdBy",\n  "isArchived" = EXCLUDED."isArchived",\n  "isPaid" = EXCLUDED."isPaid",\n  "jiraDimensionFields" = EXCLUDED."jiraDimensionFields",\n  "lastMeetingType" = EXCLUDED."lastMeetingType",\n  "tier" = EXCLUDED."tier",\n  "orgId" = EXCLUDED."orgId",\n  "isOnboardTeam" = EXCLUDED."isOnboardTeam",\n  "updatedAt" = EXCLUDED."updatedAt"',
    loc: {a: 235, b: 926, line: 18, col: 0}
  }
}
export const backupTeamQuery = new PreparedQuery(backupTeamQueryIR)

const updateUserQueryIR: any = {
  name: 'updateUserQuery',
  params: [
    {
      name: 'ids',
      codeRefs: {
        defined: {a: 36, b: 38, line: 3, col: 9},
        used: [{a: 776, b: 778, line: 19, col: 13}]
      },
      transform: {type: 'array_spread'}
    },
    {
      name: 'email',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 90, b: 94, line: 6, col: 20}]}
    },
    {
      name: 'inactive',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 130, b: 137, line: 7, col: 23}]}
    },
    {
      name: 'lastSeenAt',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 203, b: 212, line: 8, col: 50}]}
    },
    {
      name: 'preferredName',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 261, b: 273, line: 9, col: 30}]}
    },
    {
      name: 'tier',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 313, b: 316, line: 10, col: 19}]}
    },
    {
      name: 'picture',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 350, b: 356, line: 11, col: 22}]}
    },
    {
      name: 'segmentId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 397, b: 405, line: 12, col: 26}]}
    },
    {
      name: 'isRemoved',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 448, b: 456, line: 13, col: 26}]}
    },
    {
      name: 'isWatched',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 499, b: 507, line: 14, col: 26}]}
    },
    {
      name: 'reasonRemoved',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 554, b: 566, line: 15, col: 30}]}
    },
    {
      name: 'newFeatureId',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 616, b: 627, line: 16, col: 29}]}
    },
    {
      name: 'identities',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 674, b: 683, line: 17, col: 27}]}
    },
    {
      name: 'overLimitCopy',
      transform: {type: 'scalar'},
      codeRefs: {used: [{a: 731, b: 743, line: 18, col: 30}]}
    }
  ],
  usedParamSet: {
    email: true,
    inactive: true,
    lastSeenAt: true,
    preferredName: true,
    tier: true,
    picture: true,
    segmentId: true,
    isRemoved: true,
    isWatched: true,
    reasonRemoved: true,
    newFeatureId: true,
    identities: true,
    overLimitCopy: true,
    ids: true
  },
  statement: {
    body: 'UPDATE "User" SET\n  email = COALESCE(:email, "email"),\n  inactive = COALESCE(:inactive, "inactive"),\n  "lastSeenAt" = GREATEST("lastSeenAt", COALESCE(:lastSeenAt, "lastSeenAt")),\n  "preferredName" = COALESCE(:preferredName, "preferredName"),\n  tier = COALESCE(:tier, "tier"),\n  picture = COALESCE(:picture, "picture"),\n  "segmentId" = COALESCE(:segmentId, "segmentId"),\n  "isRemoved" = COALESCE(:isRemoved, "isRemoved"),\n  "isWatched" = COALESCE(:isWatched, "isWatched"),\n  "reasonRemoved" = COALESCE(:reasonRemoved, "reasonRemoved"),\n  "newFeatureId" = COALESCE(:newFeatureId, "newFeatureId"),\n  "identities" = COALESCE(:identities, "identities"),\n  "overLimitCopy" = COALESCE(:overLimitCopy, "overLimitCopy")\nWHERE id IN :ids',
    loc: {a: 52, b: 778, line: 5, col: 0}
  }
}
const updateUserQuery = new PreparedQuery(updateUserQueryIR)
export const updateUser = async (update: any, userIds: string | string[]) => {
  userIds = typeof userIds === 'string' ? [userIds] : userIds
  return updateUserQuery.run(
    {
      ...update,
      ids: userIds
    } as any,
    getPg()
  )
}

const insertTemplateRefQueryIR: any = {
  name: 'insertTemplateRefQuery',
  params: [
    {
      name: 'ref',
      codeRefs: {
        defined: {a: 43, b: 45, line: 3, col: 9},
        used: [{a: 127, b: 129, line: 9, col: 8}]
      },
      transform: {type: 'pick_tuple', keys: ['id', 'template']}
    }
  ],
  usedParamSet: {ref: true},
  statement: {
    body: 'INSERT INTO "TemplateRef" (\n  "id",\n  "template"\n)\nVALUES :ref\nON CONFLICT (id)\nDO NOTHING',
    loc: {a: 68, b: 157, line: 5, col: 0}
  }
}
export const insertTemplateRefQuery = new PreparedQuery(insertTemplateRefQueryIR)

const insertTemplateScaleRefQueryIR: any = {
  name: 'insertTemplateScaleRefQuery',
  params: [
    {
      name: 'templateScales',
      codeRefs: {
        defined: {a: 48, b: 61, line: 3, col: 9},
        used: [{a: 147, b: 160, line: 9, col: 8}]
      },
      transform: {type: 'pick_array_spread', keys: ['id', 'scale']}
    }
  ],
  usedParamSet: {templateScales: true},
  statement: {
    body: 'INSERT INTO "TemplateScaleRef" (\n  "id",\n  "scale"\n)\nVALUES :templateScales\nON CONFLICT (id)\nDO NOTHING',
    loc: {a: 86, b: 188, line: 5, col: 0}
  }
}
export const insertTemplateScaleRefQuery = new PreparedQuery(insertTemplateScaleRefQueryIR)

const insertGitHubAuthsQueryIR: any = {
  name: 'insertGitHubAuthsQuery',
  params: [
    {
      name: 'auths',
      codeRefs: {
        defined: {a: 43, b: 47, line: 3, col: 9},
        used: [{a: 245, b: 249, line: 6, col: 8}]
      },
      transform: {
        type: 'pick_array_spread',
        keys: ['accessToken', 'createdAt', 'updatedAt', 'isActive', 'login', 'teamId', 'userId']
      }
    }
  ],
  usedParamSet: {auths: true},
  statement: {
    body: 'INSERT INTO "GitHubAuth" ("accessToken", "createdAt", "updatedAt", "isActive", "login", "teamId", "userId")\nVALUES :auths',
    loc: {a: 129, b: 249, line: 5, col: 0}
  }
}
export const insertGitHubAuthsQuery = new PreparedQuery(insertGitHubAuthsQueryIR)

const insertDiscussionsQueryIR: any = {
  name: 'insertDiscussionsQuery',
  params: [
    {
      name: 'discussions',
      codeRefs: {
        defined: {a: 43, b: 53, line: 3, col: 9},
        used: [{a: 237, b: 247, line: 6, col: 8}]
      },
      transform: {
        type: 'pick_array_spread',
        keys: ['id', 'teamId', 'meetingId', 'discussionTopicId', 'discussionTopicType']
      }
    }
  ],
  usedParamSet: {discussions: true},
  statement: {
    body: 'INSERT INTO "Discussion" ("id", "teamId", "meetingId", "discussionTopicId", "discussionTopicType")\nVALUES :discussions',
    loc: {a: 130, b: 247, line: 5, col: 0}
  }
}
export const insertDiscussionsQuery = new PreparedQuery(insertDiscussionsQueryIR)

const insertAtlassianAuthsQueryIR: any = {
  name: 'insertAtlassianAuthsQuery',
  params: [
    {
      name: 'auths',
      codeRefs: {
        defined: {a: 46, b: 50, line: 3, col: 9},
        used: [{a: 367, b: 371, line: 6, col: 8}]
      },
      transform: {
        type: 'pick_array_spread',
        keys: [
          'accessToken',
          'refreshToken',
          'createdAt',
          'updatedAt',
          'isActive',
          'jiraSearchQueries',
          'cloudIds',
          'scope',
          'accountId',
          'teamId',
          'userId'
        ]
      }
    }
  ],
  usedParamSet: {auths: true},
  statement: {
    body: 'INSERT INTO "AtlassianAuth" ("accessToken", "refreshToken", "createdAt", "updatedAt", "isActive", "jiraSearchQueries", "cloudIds", "scope", "accountId", "teamId", "userId")\nVALUES :auths',
    loc: {a: 186, b: 371, line: 5, col: 0}
  }
}
export const insertAtlassianAuthsQuery = new PreparedQuery(insertAtlassianAuthsQueryIR)

const backfillSegmentIdQueryIR: any = {
  name: 'backfillSegmentIdQuery',
  params: [
    {
      name: 'users',
      codeRefs: {
        defined: {a: 43, b: 47, line: 3, col: 9},
        used: [{a: 143, b: 147, line: 7, col: 14}]
      },
      transform: {type: 'pick_array_spread', keys: ['segmentId', 'id']}
    }
  ],
  usedParamSet: {users: true},
  statement: {
    body: 'UPDATE "User" AS u SET\n  "segmentId" = c."segmentId"\nFROM (VALUES :users) AS c("segmentId", "id") \nWHERE c."id" = u."id"',
    loc: {a: 76, b: 195, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE "User" AS u SET
 *   "segmentId" = c."segmentId"
 * FROM (VALUES :users) AS c("segmentId", "id")
 * WHERE c."id" = u."id"
 * ```
 */
export const backfillSegmentIdQuery = new PreparedQuery(backfillSegmentIdQueryIR)

const updateUserTiersQueryIR: any = {
  name: 'updateUserTiersQuery',
  params: [
    {
      name: 'users',
      codeRefs: {
        defined: {a: 41, b: 45, line: 3, col: 9},
        used: [{a: 138, b: 142, line: 7, col: 14}]
      },
      transform: {type: 'pick_array_spread', keys: ['tier', 'id']}
    }
  ],
  usedParamSet: {users: true},
  statement: {
    body: 'UPDATE "User" AS u SET\n  "tier" = c."tier"::"TierEnum"\nFROM (VALUES :users) AS c("tier", "id") \nWHERE c."id" = u."id"',
    loc: {a: 69, b: 185, line: 5, col: 0}
  }
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE "User" AS u SET
 *   "tier" = c."tier"::"TierEnum"
 * FROM (VALUES :users) AS c("tier", "id")
 * WHERE c."id" = u."id"
 * ```
 */
export const updateUserTiersQuery = new PreparedQuery(updateUserTiersQueryIR)
