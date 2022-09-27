/*
  @name updateUserQuery
  @param ids -> (...)
*/
UPDATE "User" SET
  email = COALESCE(:email, "email"),
  inactive = COALESCE(:inactive, "inactive"),
  "lastSeenAt" = GREATEST("lastSeenAt", COALESCE(:lastSeenAt, "lastSeenAt")),
  "preferredName" = COALESCE(:preferredName, "preferredName"),
  tier = COALESCE(:tier, "tier"),
  picture = COALESCE(:picture, "picture"),
  "segmentId" = COALESCE(:segmentId, "segmentId"),
  "isRemoved" = COALESCE(:isRemoved, "isRemoved"),
  "sendSummaryEmail" = COALESCE(:sendSummaryEmail, "sendSummaryEmail"),
  "isWatched" = COALESCE(:isWatched, "isWatched"),
  "reasonRemoved" = COALESCE(:reasonRemoved, "reasonRemoved"),
  "newFeatureId" = COALESCE(:newFeatureId, "newFeatureId"),
  "identities" = COALESCE(:identities, "identities"),
  "overLimitCopy" = COALESCE(:overLimitCopy, "overLimitCopy")
WHERE id IN :ids;
