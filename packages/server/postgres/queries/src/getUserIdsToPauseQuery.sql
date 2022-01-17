/*
  @name getUserIdsToPauseQuery
*/
SELECT id FROM "User"
WHERE inactive = false AND "lastSeenAt" <= :activeThreshold;
