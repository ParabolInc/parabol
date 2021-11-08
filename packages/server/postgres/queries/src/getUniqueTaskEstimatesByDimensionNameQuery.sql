/*
  @name getUniqueTaskEstimatesByDimensionNameQuery
*/
SELECT DISTINCT ON ("label") "TaskEstimate".* FROM "TaskEstimate"
LEFT JOIN "GitHubDimensionFieldMap"
    ON "GitHubDimensionFieldMap"."dimensionName" = "TaskEstimate"."name"
    AND  "GitHubDimensionFieldMap"."nameWithOwner" = :nameWithOwner
    AND "GitHubDimensionFieldMap"."teamId" = :teamId
WHERE "TaskEstimate"."name" = :dimensionName
AND "TaskEstimate"."githubLabelName" IS NOT NULL;