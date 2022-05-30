/** Types generated for queries found in "packages/server/postgres/queries/src/removeIntegrationSearchQueryQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'RemoveIntegrationSearchQueryQuery' parameters type */
export interface IRemoveIntegrationSearchQueryQueryParams {
  id: number | null | void;
  userId: string | null | void;
  teamId: string | null | void;
}

/** 'RemoveIntegrationSearchQueryQuery' return type */
export type IRemoveIntegrationSearchQueryQueryResult = void;

/** 'RemoveIntegrationSearchQueryQuery' query type */
export interface IRemoveIntegrationSearchQueryQueryQuery {
  params: IRemoveIntegrationSearchQueryQueryParams;
  result: IRemoveIntegrationSearchQueryQueryResult;
}

const removeIntegrationSearchQueryQueryIR: any = {"name":"removeIntegrationSearchQueryQuery","params":[{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":146,"b":147,"line":6,"col":14}]}},{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":165,"b":170,"line":6,"col":33}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":188,"b":193,"line":6,"col":56}]}}],"usedParamSet":{"id":true,"userId":true,"teamId":true},"statement":{"body":"DELETE FROM \"IntegrationSearchQuery\"\n-- userId and teamId added here for validation\nWHERE \"id\" = :id AND \"userId\" = :userId AND \"teamId\" = :teamId","loc":{"a":48,"b":193,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM "IntegrationSearchQuery"
 * -- userId and teamId added here for validation
 * WHERE "id" = :id AND "userId" = :userId AND "teamId" = :teamId
 * ```
 */
export const removeIntegrationSearchQueryQuery = new PreparedQuery<IRemoveIntegrationSearchQueryQueryParams,IRemoveIntegrationSearchQueryQueryResult>(removeIntegrationSearchQueryQueryIR);


