/*
  @name getJiraServerDimensionFieldMapQuery
*/
SELECT * from "JiraServerDimensionFieldMap"
WHERE "providerId"= :providerId AND "teamId" = :teamId AND "projectId" = :projectId AND "issueType" = :issueType AND "dimensionName" = :dimensionName;

