/** Types generated for queries found in "packages/server/postgres/queries/src/upsertIntegrationTokenQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type stringArray = (string)[];

/** 'UpsertIntegrationTokenQuery' parameters type */
export interface IUpsertIntegrationTokenQueryParams {
  auth: {
    accessToken: string | null | void,
    oauthRefreshToken: string | null | void,
    oauthScopes: stringArray | null | void,
    providerId: number | null | void,
    teamId: string | null | void,
    userId: string | null | void
  };
}

/** 'UpsertIntegrationTokenQuery' return type */
export interface IUpsertIntegrationTokenQueryResult {
  teamId: string;
  userId: string;
  providerId: number;
  isActive: boolean;
  accessToken: string | null;
  expiresAt: Date | null;
  oauthRefreshToken: string | null;
  oauthScopes: stringArray | null;
  attributes: Json | null;
  createdAt: Date;
  updatedAt: Date;
}

/** 'UpsertIntegrationTokenQuery' query type */
export interface IUpsertIntegrationTokenQueryQuery {
  params: IUpsertIntegrationTokenQueryParams;
  result: IUpsertIntegrationTokenQueryResult;
}

const upsertIntegrationTokenQueryIR: any = {"name":"upsertIntegrationTokenQuery","params":[{"name":"auth","codeRefs":{"defined":{"a":48,"b":51,"line":3,"col":9},"used":[{"a":260,"b":263,"line":6,"col":10}]},"transform":{"type":"pick_tuple","keys":["accessToken","oauthRefreshToken","oauthScopes","providerId","teamId","userId"]}}],"usedParamSet":{"auth":true},"statement":{"body":"INSERT INTO \"IntegrationToken\" (\"accessToken\", \"oauthRefreshToken\", \"oauthScopes\", \"providerId\", \"teamId\", \"userId\")\n  VALUES :auth\n  ON CONFLICT (\"providerId\", \"userId\", \"teamId\")\n  DO UPDATE\n  SET (\"accessToken\", \"oauthRefreshToken\", \"oauthScopes\", \"providerId\", \"isActive\", \"updatedAt\") = (\n    EXCLUDED.\"accessToken\",\n    EXCLUDED.\"oauthRefreshToken\",\n    EXCLUDED.\"oauthScopes\",\n    EXCLUDED.\"providerId\",\n    TRUE,\n    CURRENT_TIMESTAMP\n  ) RETURNING *","loc":{"a":133,"b":590,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "IntegrationToken" ("accessToken", "oauthRefreshToken", "oauthScopes", "providerId", "teamId", "userId")
 *   VALUES :auth
 *   ON CONFLICT ("providerId", "userId", "teamId")
 *   DO UPDATE
 *   SET ("accessToken", "oauthRefreshToken", "oauthScopes", "providerId", "isActive", "updatedAt") = (
 *     EXCLUDED."accessToken",
 *     EXCLUDED."oauthRefreshToken",
 *     EXCLUDED."oauthScopes",
 *     EXCLUDED."providerId",
 *     TRUE,
 *     CURRENT_TIMESTAMP
 *   ) RETURNING *
 * ```
 */
export const upsertIntegrationTokenQuery = new PreparedQuery<IUpsertIntegrationTokenQueryParams,IUpsertIntegrationTokenQueryResult>(upsertIntegrationTokenQueryIR);


