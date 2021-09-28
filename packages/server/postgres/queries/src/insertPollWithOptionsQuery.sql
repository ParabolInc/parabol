/*
  @name insertPollWithOptionsQuery
  @param poll -> (createdById, discussionId, teamId, meetingId, threadSortOrder, title)
  @param pollOptions -> ((title)...)
*/
WITH poll AS (
   INSERT INTO "Poll" (
       "createdById",
       "discussionId",
       "teamId",
       "meetingId",
       "threadSortOrder",
       "title"
   ) VALUES :poll RETURNING *
), pollOptionsData AS (
  SELECT "title", (SELECT id from poll AS "pollId") FROM (VALUES :pollOptions) AS pollOptionsData(title) 
)
INSERT INTO "PollOption" ("title", "pollId")
  SELECT * FROM pollOptionsData
RETURNING "pollId";