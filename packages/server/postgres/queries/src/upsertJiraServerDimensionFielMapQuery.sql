/*
  @name upsertJiraServerDimensionFieldMapQuery
  @param fieldMap -> (providerId, teamId, projectId, dimensionName, fieldId, fieldName, fieldType)
*/
INSERT INTO "JiraServerDimensionFieldMap" ("providerId", "teamId", "projectId", "dimensionName", "fieldId", "fieldName", "fieldType")
VALUES :fieldMap
ON CONFLICT ("providerId", "teamId", "projectId", "dimensionName")
DO UPDATE SET
  "fieldId" = EXCLUDED."fieldId",
  "fieldName" = EXCLUDED."fieldName",
  "fieldType" = EXCLUDED."fieldType";
