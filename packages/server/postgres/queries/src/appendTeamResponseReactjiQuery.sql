/*
  @name appendTeamResponseReactji
  @param reactji -> (shortname, userid)
*/
UPDATE "TeamPromptResponse" SET
  "reactjis" = arr_append_uniq("reactjis", (:reactji)::"Reactji")
WHERE id = :id;
