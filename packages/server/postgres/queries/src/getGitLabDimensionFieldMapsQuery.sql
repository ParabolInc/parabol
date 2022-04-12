/*
  @name getGitLabDimensionFieldMapsQuery
*/
SELECT * from "GitLabDimensionFieldMap"
WHERE "teamId" = :teamId AND "dimensionName" = :dimensionName AND "projectPath" = :projectPath;
