/** Types generated for queries found in "packages/server/postgres/queries/src/insertApprovedOrganizationDomainsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'InsertApprovedOrganizationDomainsQuery' parameters type */
export interface IInsertApprovedOrganizationDomainsQueryParams {
  approvals: readonly ({
    domain: string | null | void,
    orgId: string | null | void,
    addedByUserId: string | null | void
  })[];
}

/** 'InsertApprovedOrganizationDomainsQuery' return type */
export type IInsertApprovedOrganizationDomainsQueryResult = void;

/** 'InsertApprovedOrganizationDomainsQuery' query type */
export interface IInsertApprovedOrganizationDomainsQueryQuery {
  params: IInsertApprovedOrganizationDomainsQueryParams;
  result: IInsertApprovedOrganizationDomainsQueryResult;
}

const insertApprovedOrganizationDomainsQueryIR: any = {"name":"insertApprovedOrganizationDomainsQuery","params":[{"name":"approvals","codeRefs":{"defined":{"a":59,"b":67,"line":3,"col":9},"used":[{"a":205,"b":213,"line":11,"col":8}]},"transform":{"type":"pick_array_spread","keys":["domain","orgId","addedByUserId"]}}],"usedParamSet":{"approvals":true},"statement":{"body":"INSERT INTO \"OrganizationApprovedDomain\" (\n  \"domain\",\n  \"orgId\",\n  \"addedByUserId\"\n)\nVALUES :approvals\nON CONFLICT (\"domain\", \"orgId\", \"removedAt\")\nDO NOTHING","loc":{"a":111,"b":269,"line":6,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "OrganizationApprovedDomain" (
 *   "domain",
 *   "orgId",
 *   "addedByUserId"
 * )
 * VALUES :approvals
 * ON CONFLICT ("domain", "orgId", "removedAt")
 * DO NOTHING
 * ```
 */
export const insertApprovedOrganizationDomainsQuery = new PreparedQuery<IInsertApprovedOrganizationDomainsQueryParams,IInsertApprovedOrganizationDomainsQueryResult>(insertApprovedOrganizationDomainsQueryIR);


