/*
  @name updateDomainsInOrganizationApprovedDomainQuery
*/
UPDATE "OrganizationApprovedDomain"
SET domain = replace(domain, :oldDomain, :newDomain)
WHERE domain LIKE :oldDomain;
