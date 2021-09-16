/*
  @name getUserIdsToPauseQuery
*/
SELECT id FROM "User"
WHERE inactive = false AND ("lastSeenAt" IS NULL OR "lastSeenAt" <= :activeThreshold);
