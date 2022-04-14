/*
  @name appendTeamResponseReactji
  @param reactji -> (shortName, userId)
*/
UPDATE "TeamPromptResponse" SET
  "reactjis" = CASE
    WHEN (:reactji)::"Reactji" = ANY("reactjis") THEN "reactjis"
    ELSE array_append("reactjis", (:reactji)::"Reactji")
  END
WHERE id = :id;
