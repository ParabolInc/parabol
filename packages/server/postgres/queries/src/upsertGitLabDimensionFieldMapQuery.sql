/*
  @name upsertGitLabDimensionFieldMapQuery
  @param fieldMap -> (teamId, dimensionName, projectPath, labelTemplate)
*/
INSERT INTO "GitLabDimensionFieldMap" ("teamId", "dimensionName", "projectPath", "labelTemplate")
VALUES :fieldMap
ON CONFLICT ("teamId", "dimensionName", "projectPath")
DO UPDATE
SET "labelTemplate" = EXCLUDED."labelTemplate";
