/*
  @name getGitHubDimensionFieldMapsQuery
  @param keys -> ((
    teamId,
    dimensionName,
    nameWithOwner
  )...)
*/
SELECT * from "GitHubDimensionFieldMap"
WHERE ("teamId", "dimensionName", "nameWithOwner") in (:keys);
