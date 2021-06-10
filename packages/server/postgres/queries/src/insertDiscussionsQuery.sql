/*
  @name insertDiscussionsQuery
  @param discussions -> ((id, teamId, meetingId, discussionTopicId, discussionTopicType)...)
*/
INSERT INTO "Discussion" ("id", "teamId", "meetingId", "discussionTopicId", "discussionTopicType")
VALUES :discussions;
