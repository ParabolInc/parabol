/** Types generated for queries found in "packages/server/postgres/queries/src/getIntegrationProvidersQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopesEnum = 'GLOBAL' | 'ORG' | 'TEAM';

export type IntegrationProviderTokenTypeEnum = 'OAUTH2' | 'PAT' | 'WEBHOOK';

export type IntegrationProvidersEnum = 'GITLAB' | 'MATTERMOST';

export type stringArray = (string)[];

/** 'GetIntegrationProvidersQuery' parameters type */
export interface IGetIntegrationProvidersQueryParams {
  providerType: IntegrationProvidersEnum | null | void;
  orgId: string | null | void;
  teamId: string | null | void;
}

/** 'GetIntegrationProvidersQuery' return type */
export interface IGetIntegrationProvidersQueryResult {
  id: number;
  providerType: IntegrationProvidersEnum;
  providerTokenType: IntegrationProviderTokenTypeEnum;
  providerScope: IntegrationProviderScopesEnum;
  providerScopeGlobal: boolean | null;
  orgId: string | null;
  teamId: string | null;
  isActive: boolean;
  name: string;
  serverBaseUri: string;
  scopes: stringArray | null;
  oauthClientId: string | null;
  oauthClientSecret: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** 'GetIntegrationProvidersQuery' query type */
export interface IGetIntegrationProvidersQueryQuery {
  params: IGetIntegrationProvidersQueryParams;
  result: IGetIntegrationProvidersQueryResult;
}

const getIntegrationProvidersQueryIR: any = {"name":"getIntegrationProvidersQuery","params":[{"name":"providerType","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":105,"b":116,"line":5,"col":26}]}},{"name":"orgId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":236,"b":240,"line":9,"col":47}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":292,"b":297,"line":10,"col":49}]}}],"usedParamSet":{"providerType":true,"orgId":true,"teamId":true},"statement":{"body":"SELECT * FROM \"IntegrationProvider\"\n  WHERE \"providerType\" = :providerType\n    AND \"isActive\" = TRUE\n    AND (\n        \"providerScope\" = 'GLOBAL'\n    OR (\"providerScope\" = 'ORG' AND \"orgId\" = :orgId)\n    OR (\"providerScope\" = 'TEAM' AND \"teamId\" = :teamId)\t\n)","loc":{"a":43,"b":301,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "IntegrationProvider"
 *   WHERE "providerType" = :providerType
 *     AND "isActive" = TRUE
 *     AND (
 *         "providerScope" = 'GLOBAL'
 *     OR ("providerScope" = 'ORG' AND "orgId" = :orgId)
 *     OR ("providerScope" = 'TEAM' AND "teamId" = :teamId)	
 * )
 * ```
 */
export const getIntegrationProvidersQuery = new PreparedQuery<IGetIntegrationProvidersQueryParams,IGetIntegrationProvidersQueryResult>(getIntegrationProvidersQueryIR);


