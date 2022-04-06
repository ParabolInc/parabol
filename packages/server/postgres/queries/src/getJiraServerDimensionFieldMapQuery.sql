/*
  @name getJiraServerDimensionFieldMapQuery
*/
SELECT * from "JiraServerDimensionFieldMap"
WHERE "providerId"= :providerId AND "teamId" = :teamId AND "projectId" = :projectId AND "dimensionName" = :dimensionName;

