/*
  @name insertUserQuery
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
  "featureFlags",
  "lastSeenAtURLs",
  "segmentId",
  "identities"
) VALUES (
  :id,
  :email,
  :createdAt,
  :updatedAt,
  :inactive,
  :lastSeenAt,
  :preferredName,
  :tier,
  :picture,
  :tms,
  :featureFlags,
  :lastSeenAtURLs,
  :segmentId,
  :identities
)
ON CONFLICT (id) DO UPDATE SET
  email = :email,
  "createdAt" = :createdAt,
  "updatedAt" = :updatedAt,
  inactive = :inactive,
  "lastSeenAt" = :lastSeenAt,
  "preferredName" = :preferredName,
  tier = :tier,
  picture = :picture,
  tms = :tms,
  "featureFlags" = :featureFlags,
  "lastSeenAtURLs" = :lastSeenAtURLs,
  "segmentId" = :segmentId,
  identities = :identities,
  "newFeatureId" = DEFAULT,
  "overLimitCopy" = DEFAULT,
  "isRemoved" = DEFAULT,
  "reasonRemoved" = DEFAULT,
  rol = DEFAULT,
  "payLaterClickCount" = DEFAULT
;
