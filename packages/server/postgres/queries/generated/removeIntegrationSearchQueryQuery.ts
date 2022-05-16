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

const removeIntegrationSearchQueryQueryIR: any = {"name":"removeIntegrationSearchQueryQuery","params":[{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":99,"b":100,"line":5,"col":14}]}},{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":118,"b":123,"line":5,"col":33}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":141,"b":146,"line":5,"col":56}]}}],"usedParamSet":{"id":true,"userId":true,"teamId":true},"statement":{"body":"DELETE FROM \"IntegrationSearchQuery\"\nWHERE \"id\" = :id AND \"userId\" = :userId AND \"teamId\" = :teamId","loc":{"a":48,"b":146,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM "IntegrationSearchQuery"
 * WHERE "id" = :id AND "userId" = :userId AND "teamId" = :teamId
 * ```
 */
export const removeIntegrationSearchQueryQuery = new PreparedQuery<IRemoveIntegrationSearchQueryQueryParams,IRemoveIntegrationSearchQueryQueryResult>(removeIntegrationSearchQueryQueryIR);


