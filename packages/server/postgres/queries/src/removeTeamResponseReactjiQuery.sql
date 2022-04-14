/*
  @name removeTeamResponseReactji
  @param reactji -> (shortName, userId)
*/
UPDATE "TeamPromptResponse" SET
  "reactjis" = array_remove("reactjis", (:reactji)::"Reactji")
WHERE id = :id;
