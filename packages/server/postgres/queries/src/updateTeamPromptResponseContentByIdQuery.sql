/*
  @name updateTeamPromptResponseContentByIdQuery
*/

UPDATE "TeamPromptResponse" SET
  "content" = :content,
  "plaintextContent" = :plaintextContent
WHERE "id" = :id;
