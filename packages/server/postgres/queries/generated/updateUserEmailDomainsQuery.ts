/** Types generated for queries found in "packages/server/postgres/queries/src/updateUserEmailDomainsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'UpdateUserEmailDomainsQuery' parameters type */
export interface IUpdateUserEmailDomainsQueryParams {
  userIds: readonly (string | null | void)[];
  newDomain: string | null | void;
}

/** 'UpdateUserEmailDomainsQuery' return type */
export interface IUpdateUserEmailDomainsQueryResult {
  id: string;
}

/** 'UpdateUserEmailDomainsQuery' query type */
export interface IUpdateUserEmailDomainsQueryQuery {
  params: IUpdateUserEmailDomainsQueryParams;
  result: IUpdateUserEmailDomainsQueryResult;
}

const updateUserEmailDomainsQueryIR: any = {"name":"updateUserEmailDomainsQuery","params":[{"name":"userIds","codeRefs":{"defined":{"a":48,"b":54,"line":3,"col":9},"used":[{"a":174,"b":180,"line":8,"col":14}]},"transform":{"type":"array_spread"}},{"name":"newDomain","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":140,"b":148,"line":7,"col":45}]}}],"usedParamSet":{"newDomain":true,"userIds":true},"statement":{"body":"UPDATE \"User\" SET email =\nCONCAT(LEFT(email, POSITION('@' in email)), :newDomain::VARCHAR)\nWHERE id in (:userIds)\nRETURNING id","loc":{"a":69,"b":194,"line":6,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "User" SET email =
 * CONCAT(LEFT(email, POSITION('@' in email)), :newDomain::VARCHAR)
 * WHERE id in (:userIds)
 * RETURNING id
 * ```
 */
export const updateUserEmailDomainsQuery = new PreparedQuery<IUpdateUserEmailDomainsQueryParams,IUpdateUserEmailDomainsQueryResult>(updateUserEmailDomainsQueryIR);


