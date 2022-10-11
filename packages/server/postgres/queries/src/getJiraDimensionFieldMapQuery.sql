/*
  @name getJiraDimensionFieldMapQuery
*/
-- Get the field for the matching issueType followed by the fields for all other issue types so we can guess a matching field
SELECT * from "JiraDimensionFieldMap"
WHERE "teamId" = :teamId AND "cloudId" = :cloudId AND "projectKey" = :projectKey AND "dimensionName" = :dimensionName
ORDER BY
  CASE "issueType"
    WHEN :issueType THEN 0
    ELSE 1
  END,
  "updatedAt"
DESC;

