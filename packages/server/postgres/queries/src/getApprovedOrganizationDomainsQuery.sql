/*
  @name getApprovedOrganizationDomainsQuery
<<<<<<< HEAD
  @param orgIds -> (...)
*/
SELECT * from "OrganizationApprovedDomain"
WHERE "orgId" IN :orgIds AND "removedAt" IS NULL;
=======
*/
SELECT * from "OrganizationApprovedDomain"
WHERE "orgId" = :orgId AND "removedAt" IS NULL;
>>>>>>> master
