/** Types generated for queries found in "packages/server/postgres/queries/src/getApprovedOrganizationDomainsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetApprovedOrganizationDomainsQuery' parameters type */
export interface IGetApprovedOrganizationDomainsQueryParams {
  orgIds: readonly (string | null | void)[];
}

/** 'GetApprovedOrganizationDomainsQuery' return type */
export interface IGetApprovedOrganizationDomainsQueryResult {
  id: number;
  createdAt: Date;
  removedAt: Date | null;
  domain: string;
  orgId: string;
  addedByUserId: string;
}

/** 'GetApprovedOrganizationDomainsQuery' query type */
export interface IGetApprovedOrganizationDomainsQueryQuery {
  params: IGetApprovedOrganizationDomainsQueryParams;
  result: IGetApprovedOrganizationDomainsQueryResult;
}

const getApprovedOrganizationDomainsQueryIR: any = {"name":"getApprovedOrganizationDomainsQuery","params":[{"name":"orgIds","codeRefs":{"defined":{"a":56,"b":61,"line":3,"col":9},"used":[{"a":136,"b":141,"line":6,"col":18}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"orgIds":true},"statement":{"body":"SELECT * from \"OrganizationApprovedDomain\"\nWHERE \"orgId\" IN :orgIds AND \"removedAt\" IS NULL","loc":{"a":75,"b":165,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * from "OrganizationApprovedDomain"
 * WHERE "orgId" IN :orgIds AND "removedAt" IS NULL
 * ```
 */
export const getApprovedOrganizationDomainsQuery = new PreparedQuery<IGetApprovedOrganizationDomainsQueryParams,IGetApprovedOrganizationDomainsQueryResult>(getApprovedOrganizationDomainsQueryIR);


