/*
  @name getGitHubDimensionFieldMapsQuery
*/
SELECT * from "GitHubDimensionFieldMap"
WHERE "teamId" = :teamId AND "dimensionName" = :dimensionName AND "nameWithOwner" = :nameWithOwner;
