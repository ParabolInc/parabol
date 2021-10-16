/** Types generated for queries found in "packages/server/postgres/queries/src/getIntegrationTokensWithProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopesEnum = 'GLOBAL' | 'ORG' | 'TEAM';

export type IntegrationProvidersEnum = 'GITLAB' | 'MATTERMOST';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type stringArray = (string)[];

/** 'GetIntegrationTokensWithProviderQuery' parameters type */
export interface IGetIntegrationTokensWithProviderQueryParams {
  teamId: string | null | void;
  byUserId: boolean | null | void;
  userId: string | null | void;
  providerType: IntegrationProvidersEnum | null | void;
}

/** 'GetIntegrationTokensWithProviderQuery' return type */
export interface IGetIntegrationTokensWithProviderQueryResult {
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
  IntegrationProvider_id: number;
  IntegrationProvider_providerType: IntegrationProvidersEnum;
  IntegrationProvider_providerScope: IntegrationProviderScopesEnum;
  IntegrationProvider_orgId: string | null;
  IntegrationProvider_teamId: string | null;
  IntegrationProvider_isActive: boolean;
  IntegrationProvider_name: string;
  IntegrationProvider_serverBaseUri: string;
  IntegrationProvider_scopes: stringArray | null;
  IntegrationProvider_oauthClientId: string | null;
  IntegrationProvider_createdAt: Date;
  IntegrationProvider_updatedAt: Date;
}

/** 'GetIntegrationTokensWithProviderQuery' query type */
export interface IGetIntegrationTokensWithProviderQueryQuery {
  params: IGetIntegrationTokensWithProviderQueryParams;
  result: IGetIntegrationTokensWithProviderQueryResult;
}

const getIntegrationTokensWithProviderQueryIR: any = {"name":"getIntegrationTokensWithProviderQuery","params":[{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1108,"b":1113,"line":22,"col":34}]}},{"name":"byUserId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1132,"b":1139,"line":23,"col":17},{"a":1153,"b":1160,"line":23,"col":38}]}},{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1197,"b":1202,"line":23,"col":82}]}},{"name":"providerType","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1254,"b":1265,"line":24,"col":48}]}}],"usedParamSet":{"teamId":true,"byUserId":true,"userId":true,"providerType":true},"statement":{"body":"SELECT\n  \"IntegrationToken\".*,\n  \"IntegrationProvider\".\"id\" AS \"IntegrationProvider_id\",\n  \"IntegrationProvider\".\"providerType\" AS \"IntegrationProvider_providerType\",\n  \"IntegrationProvider\".\"providerScope\" AS \"IntegrationProvider_providerScope\",\n  \"IntegrationProvider\".\"orgId\" AS \"IntegrationProvider_orgId\",\n  \"IntegrationProvider\".\"teamId\" AS \"IntegrationProvider_teamId\",\n  \"IntegrationProvider\".\"isActive\" AS \"IntegrationProvider_isActive\",\n  \"IntegrationProvider\".\"name\" AS \"IntegrationProvider_name\",\n  \"IntegrationProvider\".\"serverBaseUri\" AS \"IntegrationProvider_serverBaseUri\",\n  \"IntegrationProvider\".\"scopes\" AS \"IntegrationProvider_scopes\",\n  \"IntegrationProvider\".\"oauthClientId\" AS \"IntegrationProvider_oauthClientId\",\n  \"IntegrationProvider\".\"createdAt\" AS \"IntegrationProvider_createdAt\",\n  \"IntegrationProvider\".\"updatedAt\" AS \"IntegrationProvider_updatedAt\"\nFROM \"IntegrationToken\" \n  JOIN \"IntegrationProvider\"\n  ON (\"IntegrationToken\".\"integrationProviderId\" = \"IntegrationProvider\".\"id\") \n  WHERE (\n\t  \"IntegrationToken\".\"teamId\" = :teamId\n\t  AND (FALSE = :byUserId OR (TRUE = :byUserId AND \"IntegrationToken\".\"userId\" = :userId))\n    AND \"IntegrationProvider\".\"providerType\" = :providerType\n    AND \"IntegrationToken\".\"isActive\" = TRUE\n    AND \"IntegrationProvider\".\"isActive\" = TRUE\n  )","loc":{"a":52,"b":1362,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   "IntegrationToken".*,
 *   "IntegrationProvider"."id" AS "IntegrationProvider_id",
 *   "IntegrationProvider"."providerType" AS "IntegrationProvider_providerType",
 *   "IntegrationProvider"."providerScope" AS "IntegrationProvider_providerScope",
 *   "IntegrationProvider"."orgId" AS "IntegrationProvider_orgId",
 *   "IntegrationProvider"."teamId" AS "IntegrationProvider_teamId",
 *   "IntegrationProvider"."isActive" AS "IntegrationProvider_isActive",
 *   "IntegrationProvider"."name" AS "IntegrationProvider_name",
 *   "IntegrationProvider"."serverBaseUri" AS "IntegrationProvider_serverBaseUri",
 *   "IntegrationProvider"."scopes" AS "IntegrationProvider_scopes",
 *   "IntegrationProvider"."oauthClientId" AS "IntegrationProvider_oauthClientId",
 *   "IntegrationProvider"."createdAt" AS "IntegrationProvider_createdAt",
 *   "IntegrationProvider"."updatedAt" AS "IntegrationProvider_updatedAt"
 * FROM "IntegrationToken" 
 *   JOIN "IntegrationProvider"
 *   ON ("IntegrationToken"."integrationProviderId" = "IntegrationProvider"."id") 
 *   WHERE (
 * 	  "IntegrationToken"."teamId" = :teamId
 * 	  AND (FALSE = :byUserId OR (TRUE = :byUserId AND "IntegrationToken"."userId" = :userId))
 *     AND "IntegrationProvider"."providerType" = :providerType
 *     AND "IntegrationToken"."isActive" = TRUE
 *     AND "IntegrationProvider"."isActive" = TRUE
 *   )
 * ```
 */
export const getIntegrationTokensWithProviderQuery = new PreparedQuery<IGetIntegrationTokensWithProviderQueryParams,IGetIntegrationTokensWithProviderQueryResult>(getIntegrationTokensWithProviderQueryIR);


