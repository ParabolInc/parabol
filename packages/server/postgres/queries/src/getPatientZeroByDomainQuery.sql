/*
  @name getPatientZeroByDomainQuery
*/
SELECT * FROM "User"
WHERE "domain" = :domain ORDER BY "createdAt" LIMIT 1;
