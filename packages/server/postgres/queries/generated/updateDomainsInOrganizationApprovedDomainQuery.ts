/** Types generated for queries found in "packages/server/postgres/queries/src/updateDomainsInOrganizationApprovedDomainQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'UpdateDomainsInOrganizationApprovedDomainQuery' parameters type */
export interface IUpdateDomainsInOrganizationApprovedDomainQueryParams {
  oldDomain: string | null | void;
  newDomain: string | null | void;
}

/** 'UpdateDomainsInOrganizationApprovedDomainQuery' return type */
export type IUpdateDomainsInOrganizationApprovedDomainQueryResult = void;

/** 'UpdateDomainsInOrganizationApprovedDomainQuery' query type */
export interface IUpdateDomainsInOrganizationApprovedDomainQueryQuery {
  params: IUpdateDomainsInOrganizationApprovedDomainQueryParams;
  result: IUpdateDomainsInOrganizationApprovedDomainQueryResult;
}

const updateDomainsInOrganizationApprovedDomainQueryIR: any = {"name":"updateDomainsInOrganizationApprovedDomainQuery","params":[{"name":"oldDomain","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":127,"b":135,"line":5,"col":30},{"a":169,"b":177,"line":6,"col":19}]}},{"name":"newDomain","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":139,"b":147,"line":5,"col":42}]}}],"usedParamSet":{"oldDomain":true,"newDomain":true},"statement":{"body":"UPDATE \"OrganizationApprovedDomain\"\nSET domain = replace(domain, :oldDomain, :newDomain)\nWHERE domain LIKE :oldDomain","loc":{"a":61,"b":177,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "OrganizationApprovedDomain"
 * SET domain = replace(domain, :oldDomain, :newDomain)
 * WHERE domain LIKE :oldDomain
 * ```
 */
export const updateDomainsInOrganizationApprovedDomainQuery = new PreparedQuery<IUpdateDomainsInOrganizationApprovedDomainQueryParams,IUpdateDomainsInOrganizationApprovedDomainQueryResult>(updateDomainsInOrganizationApprovedDomainQueryIR);


