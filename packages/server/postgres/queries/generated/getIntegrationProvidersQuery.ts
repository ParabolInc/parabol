/** Types generated for queries found in "packages/server/postgres/queries/src/getIntegrationProvidersQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopesEnum = 'global' | 'org' | 'team';

export type IntegrationProviderTypesEnum = 'oauth2' | 'pat' | 'webhook';

export type IntegrationProvidersEnum = 'gitlab' | 'mattermost';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetIntegrationProvidersQuery' parameters type */
export interface IGetIntegrationProvidersQueryParams {
  provider: IntegrationProvidersEnum | null | void;
  orgId: string | null | void;
  teamId: string | null | void;
}

/** 'GetIntegrationProvidersQuery' return type */
export interface IGetIntegrationProvidersQueryResult {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  provider: IntegrationProvidersEnum;
  type: IntegrationProviderTypesEnum;
  scope: IntegrationProviderScopesEnum;
  scopeGlobal: boolean | null;
  orgId: string | null;
  teamId: string | null;
  isActive: boolean;
  name: string;
  providerMetadata: Json;
}

/** 'GetIntegrationProvidersQuery' query type */
export interface IGetIntegrationProvidersQueryQuery {
  params: IGetIntegrationProvidersQueryParams;
  result: IGetIntegrationProvidersQueryResult;
}

const getIntegrationProvidersQueryIR: any = {"name":"getIntegrationProvidersQuery","params":[{"name":"provider","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":105,"b":112,"line":9,"col":16}]}},{"name":"orgId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":221,"b":225,"line":15,"col":21}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":287,"b":292,"line":19,"col":22}]}}],"usedParamSet":{"provider":true,"orgId":true,"teamId":true},"statement":{"body":"SELECT\n  *\nFROM\n  \"IntegrationProvider\"\nWHERE\n  \"provider\" = :provider\n  AND \"isActive\" = TRUE\n  AND (\n    \"scope\" = 'global'\n    OR (\n      \"scope\" = 'org'\n      AND \"orgId\" = :orgId\n    )\n    OR (\n      \"scope\" = 'team'\n      AND \"teamId\" = :teamId\n    )\n  )","loc":{"a":43,"b":302,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   *
 * FROM
 *   "IntegrationProvider"
 * WHERE
 *   "provider" = :provider
 *   AND "isActive" = TRUE
 *   AND (
 *     "scope" = 'global'
 *     OR (
 *       "scope" = 'org'
 *       AND "orgId" = :orgId
 *     )
 *     OR (
 *       "scope" = 'team'
 *       AND "teamId" = :teamId
 *     )
 *   )
 * ```
 */
export const getIntegrationProvidersQuery = new PreparedQuery<IGetIntegrationProvidersQueryParams,IGetIntegrationProvidersQueryResult>(getIntegrationProvidersQueryIR);


