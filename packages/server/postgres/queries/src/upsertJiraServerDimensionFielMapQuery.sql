/*
  @name upsertJiraServerDimensionFieldMapQuery
  @param fieldMap -> (providerId, teamId, projectId, issueType, dimensionName, fieldId, fieldName, fieldType)
*/
INSERT INTO "JiraServerDimensionFieldMap" ("providerId", "teamId", "projectId", "issueType", "dimensionName", "fieldId", "fieldName", "fieldType")
VALUES :fieldMap
ON CONFLICT ("providerId", "teamId", "projectId", "issueType", "dimensionName")
DO UPDATE SET
  "fieldId" = EXCLUDED."fieldId",
  "fieldName" = EXCLUDED."fieldName",
  "fieldType" = EXCLUDED."fieldType";
