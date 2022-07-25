/*
  @name upsertAzureDevOpsDimensionFieldMapQuery
  @param fieldMap -> (teamId, dimensionName, fieldName, fieldId, instanceId, fieldType, projectKey, workItemType)
*/
INSERT INTO "AzureDevOpsDimensionFieldMap" ("teamId", "dimensionName", "fieldName", "fieldId", "instanceId", "fieldType", "projectKey", "workItemType")
VALUES :fieldMap
ON CONFLICT ("teamId", "dimensionName", "instanceId", "projectKey", "workItemType")
DO UPDATE
SET ("fieldName", "fieldId", "fieldType")  = (EXCLUDED."fieldName", EXCLUDED."fieldId", EXCLUDED."fieldType");
