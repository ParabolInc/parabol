/*
  @name getUsersByDomainQuery
*/
SELECT * FROM "User"
WHERE "domain" = :domain;
