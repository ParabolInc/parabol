/*
  @name updateJiraDimensionFieldMapQuery
*/
UPDATE "JiraDimensionFieldMap" SET 
  "teamId" = COALESCE(:teamId, "teamId"),
  "cloudId" = COALESCE(:cloudId, "cloudId"),
  "projectKey" = COALESCE(:projectKey, "projectKey"),
  "issueType" = COALESCE(:issueType, "issueType"),
  "dimensionName" = COALESCE(:dimensionName, "dimensionName"),
  "fieldId" = COALESCE(:fieldId, "fieldId"),
  "fieldName" = COALESCE(:fieldName, "fieldName"),
  "fieldType" = COALESCE(:fieldType, "fieldType")
WHERE id = :id;
