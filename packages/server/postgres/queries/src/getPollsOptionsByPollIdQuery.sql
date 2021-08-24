/*
  @name getPollOptionsByPollIdQuery
  @param ids -> (...)
*/
SELECT * FROM "PollOption"
WHERE id in :ids;
