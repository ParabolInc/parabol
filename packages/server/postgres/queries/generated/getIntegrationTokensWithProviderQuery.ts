/** Types generated for queries found in "packages/server/postgres/queries/src/getIntegrationTokensWithProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopesEnum = 'global' | 'org' | 'team';

export type IntegrationProviderTypesEnum = 'oauth2' | 'pat' | 'webhook';

export type IntegrationProvidersEnum = 'gitlab' | 'mattermost';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetIntegrationTokensWithProviderQuery' parameters type */
export interface IGetIntegrationTokensWithProviderQueryParams {
  teamId: string | null | void;
  byUserId: boolean | null | void;
  userId: string | null | void;
  provider: IntegrationProvidersEnum | null | void;
}

/** 'GetIntegrationTokensWithProviderQuery' return type */
export interface IGetIntegrationTokensWithProviderQueryResult {
  createdAt: Date;
  updatedAt: Date;
  teamId: string;
  userId: string;
  providerId: number;
  isActive: boolean;
  tokenMetadata: Json;
  IntegrationProvider_id: number;
  IntegrationProvider_provider: IntegrationProvidersEnum;
  IntegrationProvider_type: IntegrationProviderTypesEnum;
  IntegrationProvider_scope: IntegrationProviderScopesEnum;
  IntegrationProvider_orgId: string | null;
  IntegrationProvider_teamId: string | null;
  IntegrationProvider_isActive: boolean;
  IntegrationProvider_name: string;
  IntegrationProvider_providerMetadata: Json;
  IntegrationProvider_createdAt: Date;
  IntegrationProvider_updatedAt: Date;
}

/** 'GetIntegrationTokensWithProviderQuery' query type */
export interface IGetIntegrationTokensWithProviderQueryQuery {
  params: IGetIntegrationTokensWithProviderQueryParams;
  result: IGetIntegrationTokensWithProviderQueryResult;
}

const getIntegrationTokensWithProviderQueryIR: any = {"name":"getIntegrationTokensWithProviderQuery","params":[{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1002,"b":1007,"line":24,"col":35}]}},{"name":"byUserId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1034,"b":1041,"line":26,"col":15},{"a":1070,"b":1077,"line":28,"col":16}]}},{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1122,"b":1127,"line":29,"col":43}]}},{"name":"provider","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1187,"b":1194,"line":32,"col":44}]}}],"usedParamSet":{"teamId":true,"byUserId":true,"userId":true,"provider":true},"statement":{"body":"SELECT\n  \"IntegrationToken\".*,\n  \"IntegrationProvider\".\"id\" AS \"IntegrationProvider_id\",\n  \"IntegrationProvider\".\"provider\" AS \"IntegrationProvider_provider\",\n  \"IntegrationProvider\".\"type\" AS \"IntegrationProvider_type\",\n  \"IntegrationProvider\".\"scope\" AS \"IntegrationProvider_scope\",\n  \"IntegrationProvider\".\"orgId\" AS \"IntegrationProvider_orgId\",\n  \"IntegrationProvider\".\"teamId\" AS \"IntegrationProvider_teamId\",\n  \"IntegrationProvider\".\"isActive\" AS \"IntegrationProvider_isActive\",\n  \"IntegrationProvider\".\"name\" AS \"IntegrationProvider_name\",\n  \"IntegrationProvider\".\"providerMetadata\" AS \"IntegrationProvider_providerMetadata\",\n  \"IntegrationProvider\".\"createdAt\" AS \"IntegrationProvider_createdAt\",\n  \"IntegrationProvider\".\"updatedAt\" AS \"IntegrationProvider_updatedAt\"\nFROM\n  \"IntegrationToken\"\n  JOIN \"IntegrationProvider\" ON (\n    \"IntegrationToken\".\"providerId\" = \"IntegrationProvider\".\"id\"\n  )\nWHERE\n  (\n    \"IntegrationToken\".\"teamId\" = :teamId\n    AND (\n      FALSE = :byUserId\n      OR (\n        TRUE = :byUserId\n        AND \"IntegrationToken\".\"userId\" = :userId\n      )\n    )\n    AND \"IntegrationProvider\".\"provider\" = :provider\n    AND \"IntegrationToken\".\"isActive\" = TRUE\n    AND \"IntegrationProvider\".\"isActive\" = TRUE\n  )","loc":{"a":52,"b":1291,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   "IntegrationToken".*,
 *   "IntegrationProvider"."id" AS "IntegrationProvider_id",
 *   "IntegrationProvider"."provider" AS "IntegrationProvider_provider",
 *   "IntegrationProvider"."type" AS "IntegrationProvider_type",
 *   "IntegrationProvider"."scope" AS "IntegrationProvider_scope",
 *   "IntegrationProvider"."orgId" AS "IntegrationProvider_orgId",
 *   "IntegrationProvider"."teamId" AS "IntegrationProvider_teamId",
 *   "IntegrationProvider"."isActive" AS "IntegrationProvider_isActive",
 *   "IntegrationProvider"."name" AS "IntegrationProvider_name",
 *   "IntegrationProvider"."providerMetadata" AS "IntegrationProvider_providerMetadata",
 *   "IntegrationProvider"."createdAt" AS "IntegrationProvider_createdAt",
 *   "IntegrationProvider"."updatedAt" AS "IntegrationProvider_updatedAt"
 * FROM
 *   "IntegrationToken"
 *   JOIN "IntegrationProvider" ON (
 *     "IntegrationToken"."providerId" = "IntegrationProvider"."id"
 *   )
 * WHERE
 *   (
 *     "IntegrationToken"."teamId" = :teamId
 *     AND (
 *       FALSE = :byUserId
 *       OR (
 *         TRUE = :byUserId
 *         AND "IntegrationToken"."userId" = :userId
 *       )
 *     )
 *     AND "IntegrationProvider"."provider" = :provider
 *     AND "IntegrationToken"."isActive" = TRUE
 *     AND "IntegrationProvider"."isActive" = TRUE
 *   )
 * ```
 */
export const getIntegrationTokensWithProviderQuery = new PreparedQuery<IGetIntegrationTokensWithProviderQueryParams,IGetIntegrationTokensWithProviderQueryResult>(getIntegrationTokensWithProviderQueryIR);


