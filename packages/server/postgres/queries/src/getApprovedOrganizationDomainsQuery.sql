/*
  @name getApprovedOrganizationDomainsQuery
  @param orgIds -> (...)
*/
SELECT * from "OrganizationApprovedDomain"
WHERE "orgId" IN :orgIds AND "removedAt" IS NULL;
