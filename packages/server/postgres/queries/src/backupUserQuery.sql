/*
  @name backupUserQuery
  @param users -> ((
    id,
    email,
    createdAt,
    updatedAt,
    inactive,
    lastSeenAt,
    preferredName,
    tier,
    picture,
    tms,
    lastSeenAtURLs,
    identities,
    pseudoId,
    newFeatureId,
    overLimitCopy,
    isRemoved,
    reasonRemoved,
    rol
  )...)
*/
  INSERT INTO "User" (
    "id",
    "email",
    "createdAt",
    "updatedAt",
    "inactive",
    "lastSeenAt",
    "preferredName",
    "tier",
    "picture",
    "tms",
    "lastSeenAtURLs",
    "identities",
    "pseudoId",
    "newFeatureId",
    "overLimitCopy",
    "isRemoved",
    "reasonRemoved",
    "rol"
  ) VALUES :users
  ON CONFLICT (id) DO UPDATE SET
    "email" = EXCLUDED."email",
    "createdAt" = EXCLUDED."createdAt",
    "updatedAt" = EXCLUDED."updatedAt",
    "inactive" = EXCLUDED."inactive",
    "lastSeenAt" = EXCLUDED."lastSeenAt",
    "preferredName" = EXCLUDED."preferredName",
    "tier" = EXCLUDED."tier",
    "picture" = EXCLUDED."picture",
    "tms" = EXCLUDED."tms",
    "lastSeenAtURLs" = EXCLUDED."lastSeenAtURLs",
    "identities" = EXCLUDED."identities",
    "pseudoId" = EXCLUDED."pseudoId",
    "newFeatureId" = EXCLUDED."newFeatureId",
    "overLimitCopy" = EXCLUDED."overLimitCopy",
    "isRemoved" = EXCLUDED."isRemoved",
    "reasonRemoved" = EXCLUDED."reasonRemoved",
    "rol" = EXCLUDED."rol"
  ;
