/*
  @name updateUserEmailDomainsQuery
  @param userIds -> (...)
*/

UPDATE "User" SET email =
CONCAT(LEFT(email, POSITION('@' in email)), :newDomain::VARCHAR)
WHERE id in (:userIds)
RETURNING id;
