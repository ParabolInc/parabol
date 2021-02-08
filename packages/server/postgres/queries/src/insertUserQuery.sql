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
    segmentId
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
  "segmentId"
) VALUES :users;
