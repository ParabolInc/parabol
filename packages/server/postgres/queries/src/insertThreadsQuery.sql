/*
  @name insertThreadsQuery
  @param threads -> ((id, teamId, meetingId, threadSourceId, threadSourceType)...)
*/
INSERT INTO "Thread" ("id", "teamId", "meetingId", "threadSourceId", "threadSourceType")
VALUES :threads;
