/** Types generated for queries found in "packages/server/postgres/queries/src/getIntegrationTokensWithProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopesEnum = 'GLOBAL' | 'ORG' | 'TEAM';

export type IntegrationProviderTypesEnum = 'GITLAB' | 'MATTERMOST';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type stringArray = (string)[];

/** 'GetIntegrationTokensWithProviderQuery' parameters type */
export interface IGetIntegrationTokensWithProviderQueryParams {
  teamId: string | null | void;
  byUserId: boolean | null | void;
  userId: string | null | void;
  type: IntegrationProviderTypesEnum | null | void;
}

/** 'GetIntegrationTokensWithProviderQuery' return type */
export interface IGetIntegrationTokensWithProviderQueryResult {
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
  IntegrationProvider_id: number;
  IntegrationProvider_type: IntegrationProviderTypesEnum;
  IntegrationProvider_scope: IntegrationProviderScopesEnum;
  IntegrationProvider_orgId: string | null;
  IntegrationProvider_teamId: string | null;
  IntegrationProvider_isActive: boolean;
  IntegrationProvider_name: string;
  IntegrationProvider_serverBaseUri: string;
  IntegrationProvider_oauthScopes: stringArray | null;
  IntegrationProvider_oauthClientId: string | null;
  IntegrationProvider_createdAt: Date;
  IntegrationProvider_updatedAt: Date;
}

/** 'GetIntegrationTokensWithProviderQuery' query type */
export interface IGetIntegrationTokensWithProviderQueryQuery {
  params: IGetIntegrationTokensWithProviderQueryParams;
  result: IGetIntegrationTokensWithProviderQueryResult;
}

const getIntegrationTokensWithProviderQueryIR: any = {"name":"getIntegrationTokensWithProviderQuery","params":[{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1075,"b":1080,"line":22,"col":34}]}},{"name":"byUserId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1099,"b":1106,"line":23,"col":17},{"a":1120,"b":1127,"line":23,"col":38}]}},{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1164,"b":1169,"line":23,"col":82}]}},{"name":"type","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1213,"b":1216,"line":24,"col":40}]}}],"usedParamSet":{"teamId":true,"byUserId":true,"userId":true,"type":true},"statement":{"body":"SELECT\n  \"IntegrationToken\".*,\n  \"IntegrationProvider\".\"id\" AS \"IntegrationProvider_id\",\n  \"IntegrationProvider\".\"type\" AS \"IntegrationProvider_type\",\n  \"IntegrationProvider\".\"scope\" AS \"IntegrationProvider_scope\",\n  \"IntegrationProvider\".\"orgId\" AS \"IntegrationProvider_orgId\",\n  \"IntegrationProvider\".\"teamId\" AS \"IntegrationProvider_teamId\",\n  \"IntegrationProvider\".\"isActive\" AS \"IntegrationProvider_isActive\",\n  \"IntegrationProvider\".\"name\" AS \"IntegrationProvider_name\",\n  \"IntegrationProvider\".\"serverBaseUri\" AS \"IntegrationProvider_serverBaseUri\",\n  \"IntegrationProvider\".\"oauthScopes\" AS \"IntegrationProvider_oauthScopes\",\n  \"IntegrationProvider\".\"oauthClientId\" AS \"IntegrationProvider_oauthClientId\",\n  \"IntegrationProvider\".\"createdAt\" AS \"IntegrationProvider_createdAt\",\n  \"IntegrationProvider\".\"updatedAt\" AS \"IntegrationProvider_updatedAt\"\nFROM \"IntegrationToken\" \n  JOIN \"IntegrationProvider\"\n  ON (\"IntegrationToken\".\"providerId\" = \"IntegrationProvider\".\"id\") \n  WHERE (\n\t  \"IntegrationToken\".\"teamId\" = :teamId\n\t  AND (FALSE = :byUserId OR (TRUE = :byUserId AND \"IntegrationToken\".\"userId\" = :userId))\n    AND \"IntegrationProvider\".\"type\" = :type\n    AND \"IntegrationToken\".\"isActive\" = TRUE\n    AND \"IntegrationProvider\".\"isActive\" = TRUE\n  )","loc":{"a":52,"b":1313,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   "IntegrationToken".*,
 *   "IntegrationProvider"."id" AS "IntegrationProvider_id",
 *   "IntegrationProvider"."type" AS "IntegrationProvider_type",
 *   "IntegrationProvider"."scope" AS "IntegrationProvider_scope",
 *   "IntegrationProvider"."orgId" AS "IntegrationProvider_orgId",
 *   "IntegrationProvider"."teamId" AS "IntegrationProvider_teamId",
 *   "IntegrationProvider"."isActive" AS "IntegrationProvider_isActive",
 *   "IntegrationProvider"."name" AS "IntegrationProvider_name",
 *   "IntegrationProvider"."serverBaseUri" AS "IntegrationProvider_serverBaseUri",
 *   "IntegrationProvider"."oauthScopes" AS "IntegrationProvider_oauthScopes",
 *   "IntegrationProvider"."oauthClientId" AS "IntegrationProvider_oauthClientId",
 *   "IntegrationProvider"."createdAt" AS "IntegrationProvider_createdAt",
 *   "IntegrationProvider"."updatedAt" AS "IntegrationProvider_updatedAt"
 * FROM "IntegrationToken" 
 *   JOIN "IntegrationProvider"
 *   ON ("IntegrationToken"."providerId" = "IntegrationProvider"."id") 
 *   WHERE (
 * 	  "IntegrationToken"."teamId" = :teamId
 * 	  AND (FALSE = :byUserId OR (TRUE = :byUserId AND "IntegrationToken"."userId" = :userId))
 *     AND "IntegrationProvider"."type" = :type
 *     AND "IntegrationToken"."isActive" = TRUE
 *     AND "IntegrationProvider"."isActive" = TRUE
 *   )
 * ```
 */
export const getIntegrationTokensWithProviderQuery = new PreparedQuery<IGetIntegrationTokensWithProviderQueryParams,IGetIntegrationTokensWithProviderQueryResult>(getIntegrationTokensWithProviderQueryIR);


