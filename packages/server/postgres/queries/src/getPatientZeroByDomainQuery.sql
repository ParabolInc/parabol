/*
  @name getPatientZeroByDomainQuery
*/
SELECT * FROM "User"
WHERE "domain" = :domain LIMIT 1;
