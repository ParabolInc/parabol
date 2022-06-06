/** Types generated for queries found in "packages/server/postgres/queries/src/removeApprovedOrganizationDomainsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'RemoveApprovedOrganizationDomainsQuery' parameters type */
export interface IRemoveApprovedOrganizationDomainsQueryParams {
  domains: readonly (string | null | void)[];
  orgId: string | null | void;
}

/** 'RemoveApprovedOrganizationDomainsQuery' return type */
export type IRemoveApprovedOrganizationDomainsQueryResult = void;

/** 'RemoveApprovedOrganizationDomainsQuery' query type */
export interface IRemoveApprovedOrganizationDomainsQueryQuery {
  params: IRemoveApprovedOrganizationDomainsQueryParams;
  result: IRemoveApprovedOrganizationDomainsQueryResult;
}

const removeApprovedOrganizationDomainsQueryIR: any = {"name":"removeApprovedOrganizationDomainsQuery","params":[{"name":"domains","codeRefs":{"defined":{"a":59,"b":65,"line":3,"col":9},"used":[{"a":194,"b":200,"line":9,"col":17}]},"transform":{"type":"array_spread"}},{"name":"orgId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":171,"b":175,"line":8,"col":17}]}}],"usedParamSet":{"orgId":true,"domains":true},"statement":{"body":"UPDATE \"OrganizationApprovedDomain\" SET\n  \"removedAt\" = CURRENT_TIMESTAMP\nWHERE \"orgId\" = :orgId\nAND \"domain\" in :domains","loc":{"a":80,"b":200,"line":6,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "OrganizationApprovedDomain" SET
 *   "removedAt" = CURRENT_TIMESTAMP
 * WHERE "orgId" = :orgId
 * AND "domain" in :domains
 * ```
 */
export const removeApprovedOrganizationDomainsQuery = new PreparedQuery<IRemoveApprovedOrganizationDomainsQueryParams,IRemoveApprovedOrganizationDomainsQueryResult>(removeApprovedOrganizationDomainsQueryIR);


