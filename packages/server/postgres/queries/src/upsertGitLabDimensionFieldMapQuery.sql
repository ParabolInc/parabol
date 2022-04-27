/*
  @name upsertGitLabDimensionFieldMapQuery
  @param fieldMap -> (teamId, dimensionName, projectId, providerId, labelTemplate)
*/
INSERT INTO "GitLabDimensionFieldMap" ("teamId", "dimensionName", "projectId", "providerId", "labelTemplate")
VALUES :fieldMap
ON CONFLICT ("teamId", "dimensionName", "projectId", "providerId")
DO UPDATE
SET "labelTemplate" = EXCLUDED."labelTemplate";
