/*
  @name getApprovedOrganizationDomainsByDomainsQuery
  @param domains -> (...)
*/
SELECT * from "OrganizationApprovedDomain"
WHERE "domain" in :domains AND "removedAt" IS NULL;
