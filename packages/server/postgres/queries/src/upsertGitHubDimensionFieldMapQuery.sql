/*
  @name upsertGitHubDimensionFieldMapQuery
  @param fieldMap -> (teamId, dimensionName, nameWithOwner, labelTemplate)
*/
INSERT INTO "GitHubDimensionFieldMap" ("teamId", "dimensionName", "nameWithOwner", "labelTemplate")
VALUES :fieldMap
ON CONFLICT ("teamId", "dimensionName", "nameWithOwner")
DO UPDATE
SET "labelTemplate" = EXCLUDED."labelTemplate";
