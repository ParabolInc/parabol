/*
  @name insertApprovedOrganizationDomainsQuery
  @param approvals -> ((domain,orgId, addedByUserId)...)
*/

INSERT INTO "OrganizationApprovedDomain" (
  "domain",
  "orgId",
  "addedByUserId"
)
VALUES :approvals
ON CONFLICT
DO NOTHING;
