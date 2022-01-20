/*
  @name getAtlassianAuthsToUpdateQuery
*/
SELECT * from "AtlassianAuth"
WHERE "updatedAt" <= :updatedAtThreshold;
