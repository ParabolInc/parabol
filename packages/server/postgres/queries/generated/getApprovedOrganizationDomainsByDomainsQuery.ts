/** Types generated for queries found in "packages/server/postgres/queries/src/getApprovedOrganizationDomainsByDomainsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetApprovedOrganizationDomainsByDomainsQuery' parameters type */
export interface IGetApprovedOrganizationDomainsByDomainsQueryParams {
  domains: readonly (string | null | void)[];
}

/** 'GetApprovedOrganizationDomainsByDomainsQuery' return type */
export interface IGetApprovedOrganizationDomainsByDomainsQueryResult {
  id: number;
  createdAt: Date;
  removedAt: Date | null;
  domain: string;
  orgId: string;
  addedByUserId: string;
}

/** 'GetApprovedOrganizationDomainsByDomainsQuery' query type */
export interface IGetApprovedOrganizationDomainsByDomainsQueryQuery {
  params: IGetApprovedOrganizationDomainsByDomainsQueryParams;
  result: IGetApprovedOrganizationDomainsByDomainsQueryResult;
}

const getApprovedOrganizationDomainsByDomainsQueryIR: any = {"name":"getApprovedOrganizationDomainsByDomainsQuery","params":[{"name":"domains","codeRefs":{"defined":{"a":65,"b":71,"line":3,"col":9},"used":[{"a":147,"b":153,"line":6,"col":19}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"domains":true},"statement":{"body":"SELECT * from \"OrganizationApprovedDomain\"\nWHERE \"domain\" in :domains AND \"removedAt\" IS NULL","loc":{"a":85,"b":177,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * from "OrganizationApprovedDomain"
 * WHERE "domain" in :domains AND "removedAt" IS NULL
 * ```
 */
export const getApprovedOrganizationDomainsByDomainsQuery = new PreparedQuery<IGetApprovedOrganizationDomainsByDomainsQueryParams,IGetApprovedOrganizationDomainsByDomainsQueryResult>(getApprovedOrganizationDomainsByDomainsQueryIR);


