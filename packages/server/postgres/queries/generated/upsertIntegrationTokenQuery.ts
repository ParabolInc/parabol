/** Types generated for queries found in "packages/server/postgres/queries/src/upsertIntegrationTokenQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'UpsertIntegrationTokenQuery' parameters type */
export interface IUpsertIntegrationTokenQueryParams {
  auth: {
    tokenMetadata: Json | null | void,
    providerId: number | null | void,
    teamId: string | null | void,
    userId: string | null | void
  };
}

/** 'UpsertIntegrationTokenQuery' return type */
export type IUpsertIntegrationTokenQueryResult = void;

/** 'UpsertIntegrationTokenQuery' query type */
export interface IUpsertIntegrationTokenQueryQuery {
  params: IUpsertIntegrationTokenQueryParams;
  result: IUpsertIntegrationTokenQueryResult;
}

const upsertIntegrationTokenQueryIR: any = {"name":"upsertIntegrationTokenQuery","params":[{"name":"auth","codeRefs":{"defined":{"a":46,"b":49,"line":3,"col":8},"used":[{"a":217,"b":220,"line":13,"col":3}]},"transform":{"type":"pick_tuple","keys":["tokenMetadata","providerId","teamId","userId"]}}],"usedParamSet":{"auth":true},"statement":{"body":"INSERT INTO\n  \"IntegrationToken\" (\n    \"tokenMetadata\",\n    \"providerId\",\n    \"teamId\",\n    \"userId\"\n  )\nVALUES\n  :auth ON CONFLICT (\"providerId\", \"userId\", \"teamId\") DO\nUPDATE\nSET\n  (\n    \"tokenMetadata\",\n    \"providerId\",\n    \"isActive\",\n    \"updatedAt\"\n  ) = (\n    EXCLUDED.\"tokenMetadata\",\n    EXCLUDED.\"providerId\",\n    TRUE,\n    CURRENT_TIMESTAMP\n  )","loc":{"a":102,"b":457,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO
 *   "IntegrationToken" (
 *     "tokenMetadata",
 *     "providerId",
 *     "teamId",
 *     "userId"
 *   )
 * VALUES
 *   :auth ON CONFLICT ("providerId", "userId", "teamId") DO
 * UPDATE
 * SET
 *   (
 *     "tokenMetadata",
 *     "providerId",
 *     "isActive",
 *     "updatedAt"
 *   ) = (
 *     EXCLUDED."tokenMetadata",
 *     EXCLUDED."providerId",
 *     TRUE,
 *     CURRENT_TIMESTAMP
 *   )
 * ```
 */
export const upsertIntegrationTokenQuery = new PreparedQuery<IUpsertIntegrationTokenQueryParams,IUpsertIntegrationTokenQueryResult>(upsertIntegrationTokenQueryIR);


