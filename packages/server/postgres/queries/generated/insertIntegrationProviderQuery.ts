/** Types generated for queries found in "packages/server/postgres/queries/src/insertIntegrationProviderQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderScopesEnum = 'global' | 'org' | 'team';

export type IntegrationProviderTokenTypeEnum = 'oauth2' | 'pat' | 'webhook';

export type IntegrationProviderTypesEnum = 'gitlab' | 'mattermost';

export type stringArray = (string)[];

/** 'InsertIntegrationProviderQuery' parameters type */
export interface IInsertIntegrationProviderQueryParams {
  type: IntegrationProviderTypesEnum | null | void;
  tokenType: IntegrationProviderTokenTypeEnum | null | void;
  scope: IntegrationProviderScopesEnum | null | void;
  name: string | null | void;
  serverBaseUri: string | null | void;
  oauthClientId: string | null | void;
  oauthClientSecret: string | null | void;
  oauthScopes: stringArray | null | void;
  orgId: string | null | void;
  teamId: string | null | void;
}

/** 'InsertIntegrationProviderQuery' return type */
export type IInsertIntegrationProviderQueryResult = void;

/** 'InsertIntegrationProviderQuery' query type */
export interface IInsertIntegrationProviderQueryQuery {
  params: IInsertIntegrationProviderQueryParams;
  result: IInsertIntegrationProviderQueryResult;
}

const insertIntegrationProviderQueryIR: any = {"name":"insertIntegrationProviderQuery","params":[{"name":"type","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":241,"b":244,"line":16,"col":3}]}},{"name":"tokenType","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":250,"b":258,"line":17,"col":3}]}},{"name":"scope","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":264,"b":268,"line":18,"col":3}]}},{"name":"name","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":274,"b":277,"line":19,"col":3}]}},{"name":"serverBaseUri","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":283,"b":295,"line":20,"col":3}]}},{"name":"oauthClientId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":301,"b":313,"line":21,"col":3}]}},{"name":"oauthClientSecret","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":319,"b":335,"line":22,"col":3}]}},{"name":"oauthScopes","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":341,"b":351,"line":23,"col":3}]}},{"name":"orgId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":357,"b":361,"line":24,"col":3}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":367,"b":372,"line":25,"col":3}]}}],"usedParamSet":{"type":true,"tokenType":true,"scope":true,"name":true,"serverBaseUri":true,"oauthClientId":true,"oauthClientSecret":true,"oauthScopes":true,"orgId":true,"teamId":true},"statement":{"body":"INSERT INTO \"IntegrationProvider\" (\n  \"type\",\n  \"tokenType\",\n  \"scope\",\n  \"name\",\n  \"serverBaseUri\",\n  \"oauthClientId\",\n  \"oauthClientSecret\",\n  \"oauthScopes\",\n  \"orgId\",\n  \"teamId\"\n) VALUES (\n  :type,\n  :tokenType,\n  :scope,\n  :name,\n  :serverBaseUri,\n  :oauthClientId,\n  :oauthClientSecret,\n  :oauthScopes,\n  :orgId,\n  :teamId\n)","loc":{"a":45,"b":374,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "IntegrationProvider" (
 *   "type",
 *   "tokenType",
 *   "scope",
 *   "name",
 *   "serverBaseUri",
 *   "oauthClientId",
 *   "oauthClientSecret",
 *   "oauthScopes",
 *   "orgId",
 *   "teamId"
 * ) VALUES (
 *   :type,
 *   :tokenType,
 *   :scope,
 *   :name,
 *   :serverBaseUri,
 *   :oauthClientId,
 *   :oauthClientSecret,
 *   :oauthScopes,
 *   :orgId,
 *   :teamId
 * )
 * ```
 */
export const insertIntegrationProviderQuery = new PreparedQuery<IInsertIntegrationProviderQueryParams,IInsertIntegrationProviderQueryResult>(insertIntegrationProviderQueryIR);


