/*
  @name getUsersByEmailsQuery
  @param emails -> (...)
*/
SELECT * FROM "User"
WHERE email in :emails;
