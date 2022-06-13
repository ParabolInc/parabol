/*
  @name updateUserEmailDomainsQuery
*/

UPDATE "User" SET email =
CONCAT(LEFT(email, POSITION('@' in email)), :newDomain::VARCHAR)
WHERE domain = :oldDomain
RETURNING id;
