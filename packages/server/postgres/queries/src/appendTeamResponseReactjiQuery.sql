/*
  @name appendTeamResponseReactji
  @param reactji -> (shortName, userId)
*/
UPDATE "TeamPromptResponse" SET
  "reactjis" = arr_append_uniq("reactjis", (:reactji)::"Reactji")
WHERE id = :id;
