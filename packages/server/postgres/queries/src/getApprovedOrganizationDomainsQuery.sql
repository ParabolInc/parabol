/*
  @name getApprovedOrganizationDomainsQuery
*/
SELECT * from "OrganizationApprovedDomain"
WHERE "orgId" = :orgId AND "removedAt" IS NULL;
