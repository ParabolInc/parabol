/*
  @name backfillSegmentIdQuery
  @param users -> ((segmentId, id)...)
*/
UPDATE "User" AS u SET
  "segmentId" = c."segmentId"
FROM (VALUES :users) AS c("segmentId", "id") 
WHERE c."id" = u."id";