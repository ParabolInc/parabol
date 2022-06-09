/*
  @name updateUserEmailDomainsQuery
*/

UPDATE "User" SET email =
CONCAT(LEFT(email, POSITION('@' in email)), :newDomain::VARCHAR)
WHERE RIGHT(email, length(:oldDomain)) = :oldDomain;
