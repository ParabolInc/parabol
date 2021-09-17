/*
  @name getPollOptionsByPollIdsQuery
  @param pollIds -> (...)
*/
SELECT * FROM "PollOption"
WHERE "pollId" in :pollIds;
