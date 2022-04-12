/*
  @name upsertGitLabDimensionFieldMapQuery
  @param fieldMap -> (teamId, dimensionName, gid, labelTemplate)
*/
INSERT INTO "GitLabDimensionFieldMap" ("teamId", "dimensionName", "gid", "labelTemplate")
VALUES :fieldMap
ON CONFLICT ("teamId", "dimensionName", "gid")
DO UPDATE
SET "labelTemplate" = EXCLUDED."labelTemplate";
