/** Types generated for queries found in "packages/server/postgres/queries/src/updateUserEmailDomainsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'UpdateUserEmailDomainsQuery' parameters type */
export interface IUpdateUserEmailDomainsQueryParams {
  newDomain: string | null | void;
  oldDomain: string | null | void;
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

const updateUserEmailDomainsQueryIR: any = {"name":"updateUserEmailDomainsQuery","params":[{"name":"newDomain","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":114,"b":122,"line":6,"col":45}]}},{"name":"oldDomain","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":153,"b":161,"line":7,"col":19}]}}],"usedParamSet":{"newDomain":true,"oldDomain":true},"statement":{"body":"UPDATE \"User\" SET email =\nCONCAT(LEFT(email, POSITION('@' in email)), :newDomain::VARCHAR)\nWHERE domain LIKE :oldDomain\nRETURNING id","loc":{"a":43,"b":174,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "User" SET email =
 * CONCAT(LEFT(email, POSITION('@' in email)), :newDomain::VARCHAR)
 * WHERE domain LIKE :oldDomain
 * RETURNING id
 * ```
 */
export const updateUserEmailDomainsQuery = new PreparedQuery<IUpdateUserEmailDomainsQueryParams,IUpdateUserEmailDomainsQueryResult>(updateUserEmailDomainsQueryIR);


