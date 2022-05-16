/*
  @name upsertAzureDevOpsDimensionFieldMapQuery
  @param fieldMap -> (teamId, dimensionName, fieldName, fieldId, instanceId, fieldType, projectKey)
*/
INSERT INTO "AzureDevOpsDimensionFieldMap" ("teamId", "dimensionName", "fieldName", "fieldId", "instanceId", "fieldType", "projectKey")
VALUES :fieldMap
ON CONFLICT ("teamId", "dimensionName", "instanceId", "projectKey")
DO UPDATE
SET "fieldName" = EXCLUDED."fieldName", "fieldId" = EXCLUDED."fieldId", "fieldType" = EXCLUDED."fieldType";
