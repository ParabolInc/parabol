/*
  @name getUsersByDomainQuery
*/
SELECT * FROM "User"
WHERE split_part(email, '@', 2) = :domain;
