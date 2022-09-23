/*
  @name getJiraDimensionFieldMapQuery
*/
SELECT * from "JiraDimensionFieldMap"
WHERE "teamId" = :teamId AND "cloudId"= :cloudId AND "projectKey" = :projectKey AND "issueType" = :issueType AND "dimensionName" = :dimensionName;

