/*
  @name removeTeamResponseReactji
  @param reactji -> (shortname, userid)
*/
UPDATE "TeamPromptResponse" SET
  "reactjis" = array_remove("reactjis", (:reactji)::"Reactji")
WHERE CONCAT('teamPromptResponse:', "id") = :id;
