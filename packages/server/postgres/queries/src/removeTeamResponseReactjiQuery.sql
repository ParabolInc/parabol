/*
  @name removeTeamResponseReactji
  @param reactji -> (shortname, userid)
*/
UPDATE "TeamPromptResponse" SET
  "reactjis" = array_remove("reactjis", (:reactji)::"Reactji")
WHERE id = :id;
