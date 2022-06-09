/** Types generated for queries found in "packages/server/postgres/queries/src/changeEmailDomainQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'ChangeEmailDomainQuery' parameters type */
export interface IChangeEmailDomainQueryParams {
  oldDomain: string | null | void;
  newDomain: string | null | void;
}

/** 'ChangeEmailDomainQuery' return type */
export type IChangeEmailDomainQueryResult = void;

/** 'ChangeEmailDomainQuery' query type */
export interface IChangeEmailDomainQueryQuery {
  params: IChangeEmailDomainQueryParams;
  result: IChangeEmailDomainQueryResult;
}

const changeEmailDomainQueryIR: any = {"name":"changeEmailDomainQuery","params":[{"name":"oldDomain","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":103,"b":111,"line":5,"col":30},{"a":142,"b":150,"line":6,"col":16}]}},{"name":"newDomain","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":115,"b":123,"line":5,"col":42}]}}],"usedParamSet":{"oldDomain":true,"newDomain":true},"statement":{"body":"UPDATE \"OrganizationApprovedDomain\"\nSET domain = replace(domain, :oldDomain, :newDomain)\nWHERE domain = :oldDomain","loc":{"a":37,"b":150,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "OrganizationApprovedDomain"
 * SET domain = replace(domain, :oldDomain, :newDomain)
 * WHERE domain = :oldDomain
 * ```
 */
export const changeEmailDomainQuery = new PreparedQuery<IChangeEmailDomainQueryParams,IChangeEmailDomainQueryResult>(changeEmailDomainQueryIR);


