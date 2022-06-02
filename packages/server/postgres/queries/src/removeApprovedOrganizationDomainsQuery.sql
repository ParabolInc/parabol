/*
  @name removeApprovedOrganizationDomainsQuery
  @param domains -> (...)
*/

UPDATE "OrganizationApprovedDomain" SET
  "removedAt" = CURRENT_TIMESTAMP
WHERE "orgId" = :orgId
AND "domain" in :domains;
