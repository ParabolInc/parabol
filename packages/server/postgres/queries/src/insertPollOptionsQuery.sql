/*
  @name insertPollOptionQuery
  @param pollOptions -> ((pollId, title)...)
*/
INSERT INTO "PollOption" (
  "pollId",
  "title"
) VALUES :pollOptions;
