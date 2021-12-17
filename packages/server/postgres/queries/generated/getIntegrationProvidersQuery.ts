/** Types generated for queries found in "packages/server/postgres/queries/src/getIntegrationProvidersQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopesEnum = 'global' | 'org' | 'team';

export type IntegrationProviderTokenTypeEnum = 'oauth2' | 'pat' | 'webhook';

export type IntegrationProviderTypesEnum = 'gitlab' | 'mattermost';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetIntegrationProvidersQuery' parameters type */
export interface IGetIntegrationProvidersQueryParams {
  type: IntegrationProviderTypesEnum | null | void;
  orgId: string | null | void;
  teamId: string | null | void;
}

/** 'GetIntegrationProvidersQuery' return type */
export interface IGetIntegrationProvidersQueryResult {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  type: IntegrationProviderTypesEnum;
  tokenType: IntegrationProviderTokenTypeEnum;
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

const getIntegrationProvidersQueryIR: any = {"name":"getIntegrationProvidersQuery","params":[{"name":"type","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":97,"b":100,"line":5,"col":18}]}},{"name":"orgId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":204,"b":208,"line":9,"col":39}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":252,"b":257,"line":10,"col":41}]}}],"usedParamSet":{"type":true,"orgId":true,"teamId":true},"statement":{"body":"SELECT * FROM \"IntegrationProvider\"\n  WHERE \"type\" = :type\n    AND \"isActive\" = TRUE\n    AND (\n        \"scope\" = 'global'\n    OR (\"scope\" = 'org' AND \"orgId\" = :orgId)\n    OR (\"scope\" = 'team' AND \"teamId\" = :teamId)\n)","loc":{"a":43,"b":260,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "IntegrationProvider"
 *   WHERE "type" = :type
 *     AND "isActive" = TRUE
 *     AND (
 *         "scope" = 'global'
 *     OR ("scope" = 'org' AND "orgId" = :orgId)
 *     OR ("scope" = 'team' AND "teamId" = :teamId)
 * )
 * ```
 */
export const getIntegrationProvidersQuery = new PreparedQuery<IGetIntegrationProvidersQueryParams,IGetIntegrationProvidersQueryResult>(getIntegrationProvidersQueryIR);


