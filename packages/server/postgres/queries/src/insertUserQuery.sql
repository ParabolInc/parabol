/*
  @name insertUserQuery
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
    featureFlags,
    lastSeenAtURLs,
    segmentId,
    identities
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
  "featureFlags",
  "lastSeenAtURLs",
  "segmentId",
  "identities"
) VALUES :users;
