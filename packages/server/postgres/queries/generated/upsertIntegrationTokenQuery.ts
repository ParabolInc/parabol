/** Types generated for queries found in "packages/server/postgres/queries/src/upsertIntegrationTokenQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type stringArray = (string)[];

/** 'UpsertIntegrationTokenQuery' parameters type */
export interface IUpsertIntegrationTokenQueryParams {
  auth: {
    accessToken: string | null | void,
    oauthRefreshToken: string | null | void,
    scopes: stringArray | null | void,
    integrationProviderId: number | null | void,
    teamId: string | null | void,
    userId: string | null | void
  };
}

/** 'UpsertIntegrationTokenQuery' return type */
export interface IUpsertIntegrationTokenQueryResult {
  teamId: string;
  userId: string;
  integrationProviderId: number;
  isActive: boolean;
  accessToken: string | null;
  expiresAt: Date | null;
  oauthRefreshToken: string | null;
  scopes: stringArray | null;
  attributes: Json | null;
  createdAt: Date;
  updatedAt: Date;
}

/** 'UpsertIntegrationTokenQuery' query type */
export interface IUpsertIntegrationTokenQueryQuery {
  params: IUpsertIntegrationTokenQueryParams;
  result: IUpsertIntegrationTokenQueryResult;
}

const upsertIntegrationTokenQueryIR: any = {"name":"upsertIntegrationTokenQuery","params":[{"name":"auth","codeRefs":{"defined":{"a":48,"b":51,"line":3,"col":9},"used":[{"a":272,"b":275,"line":6,"col":10}]},"transform":{"type":"pick_tuple","keys":["accessToken","oauthRefreshToken","scopes","integrationProviderId","teamId","userId"]}}],"usedParamSet":{"auth":true},"statement":{"body":"INSERT INTO \"IntegrationToken\" (\"accessToken\", \"oauthRefreshToken\", \"scopes\", \"integrationProviderId\", \"teamId\", \"userId\")\n  VALUES :auth\n  ON CONFLICT (\"integrationProviderId\", \"userId\", \"teamId\")\n  DO UPDATE\n  SET (\"accessToken\", \"oauthRefreshToken\", \"scopes\", \"integrationProviderId\", \"isActive\", \"updatedAt\") = (\n    EXCLUDED.\"accessToken\",\n    EXCLUDED.\"oauthRefreshToken\",\n    EXCLUDED.\"scopes\",\n    EXCLUDED.\"integrationProviderId\",\n    TRUE,\n    CURRENT_TIMESTAMP\n  ) RETURNING *","loc":{"a":139,"b":625,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "IntegrationToken" ("accessToken", "oauthRefreshToken", "scopes", "integrationProviderId", "teamId", "userId")
 *   VALUES :auth
 *   ON CONFLICT ("integrationProviderId", "userId", "teamId")
 *   DO UPDATE
 *   SET ("accessToken", "oauthRefreshToken", "scopes", "integrationProviderId", "isActive", "updatedAt") = (
 *     EXCLUDED."accessToken",
 *     EXCLUDED."oauthRefreshToken",
 *     EXCLUDED."scopes",
 *     EXCLUDED."integrationProviderId",
 *     TRUE,
 *     CURRENT_TIMESTAMP
 *   ) RETURNING *
 * ```
 */
export const upsertIntegrationTokenQuery = new PreparedQuery<IUpsertIntegrationTokenQueryParams,IUpsertIntegrationTokenQueryResult>(upsertIntegrationTokenQueryIR);


