/*
  @name getAzureDevOpsDimensionFieldMapsQuery
*/
SELECT * from "AzureDevOpsDimensionFieldMap"
WHERE "teamId" = :teamId AND "dimensionName" = :dimensionName AND "instanceId" = :instanceId AND "projectKey" = :projectKey AND "workItemType" = :workItemType;
