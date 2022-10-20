/*
  @name upsertJiraDimensionFieldMapQuery
  @param fieldMap -> (teamId, cloudId, projectKey, issueType, dimensionName, fieldId, fieldName, fieldType)
*/
INSERT INTO "JiraDimensionFieldMap" ("teamId", "cloudId", "projectKey", "issueType", "dimensionName", "fieldId", "fieldName", "fieldType")
VALUES :fieldMap
ON CONFLICT ("teamId", "cloudId", "projectKey", "issueType", "dimensionName")
DO UPDATE SET
  "fieldId" = EXCLUDED."fieldId",
  "fieldName" = EXCLUDED."fieldName",
  "fieldType" = EXCLUDED."fieldType";
