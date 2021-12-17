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
export interface IUpsertIntegrationTokenQueryResult {
  createdAt: Date;
  updatedAt: Date;
  teamId: string;
  userId: string;
  providerId: number;
  isActive: boolean;
  tokenMetadata: Json;
}

/** 'UpsertIntegrationTokenQuery' query type */
export interface IUpsertIntegrationTokenQueryQuery {
  params: IUpsertIntegrationTokenQueryParams;
  result: IUpsertIntegrationTokenQueryResult;
}

const upsertIntegrationTokenQueryIR: any = {"name":"upsertIntegrationTokenQuery","params":[{"name":"auth","codeRefs":{"defined":{"a":48,"b":51,"line":3,"col":9},"used":[{"a":196,"b":199,"line":6,"col":10}]},"transform":{"type":"pick_tuple","keys":["tokenMetadata","providerId","teamId","userId"]}}],"usedParamSet":{"auth":true},"statement":{"body":"INSERT INTO \"IntegrationToken\" (\"tokenMetadata\", \"providerId\", \"teamId\", \"userId\")\n  VALUES :auth\n  ON CONFLICT (\"providerId\", \"userId\", \"teamId\")\n  DO UPDATE\n  SET (\"tokenMetadata\", \"providerId\", \"isActive\", \"updatedAt\") = (\n    EXCLUDED.\"tokenMetadata\",\n    EXCLUDED.\"providerId\",\n    TRUE,\n    CURRENT_TIMESTAMP\n  ) RETURNING *","loc":{"a":103,"b":432,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "IntegrationToken" ("tokenMetadata", "providerId", "teamId", "userId")
 *   VALUES :auth
 *   ON CONFLICT ("providerId", "userId", "teamId")
 *   DO UPDATE
 *   SET ("tokenMetadata", "providerId", "isActive", "updatedAt") = (
 *     EXCLUDED."tokenMetadata",
 *     EXCLUDED."providerId",
 *     TRUE,
 *     CURRENT_TIMESTAMP
 *   ) RETURNING *
 * ```
 */
export const upsertIntegrationTokenQuery = new PreparedQuery<IUpsertIntegrationTokenQueryParams,IUpsertIntegrationTokenQueryResult>(upsertIntegrationTokenQueryIR);


