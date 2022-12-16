/*
  @name upsertTeamPromptResponsesQuery
  @param responses -> ((meetingId, userId, sortOrder, content, plaintextContent, isDraft)...)
*/
INSERT INTO "TeamPromptResponse" ("meetingId", "userId", "sortOrder", "content", "plaintextContent", "isDraft")
VALUES :responses
ON CONFLICT ("meetingId", "userId") DO UPDATE SET
  "content" = EXCLUDED."content",
  "plaintextContent" = EXCLUDED."plaintextContent",
  "isDraft" = "TeamPromptResponse"."isDraft" AND EXCLUDED."isDraft",
  "createdAt" = CASE WHEN NOT EXCLUDED."isDraft" AND "TeamPromptResponse"."isDraft" THEN CURRENT_TIMESTAMP ELSE "TeamPromptResponse"."createdAt" END,
  "updatedAt" = CASE WHEN NOT EXCLUDED."isDraft" AND "TeamPromptResponse"."isDraft" THEN CURRENT_TIMESTAMP ELSE "TeamPromptResponse"."updatedAt" END
RETURNING id;
