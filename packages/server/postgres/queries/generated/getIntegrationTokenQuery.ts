/** Types generated for queries found in "packages/server/postgres/queries/src/getIntegrationTokenQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderServiceEnum = 'gitlab' | 'mattermost';

/** 'GetIntegrationTokenQuery' parameters type */
export interface IGetIntegrationTokenQueryParams {
  teamId: string | null | void;
  userId: string | null | void;
  service: IntegrationProviderServiceEnum | null | void;
}

/** 'GetIntegrationTokenQuery' return type */
export interface IGetIntegrationTokenQueryResult {
  createdAt: Date;
  updatedAt: Date;
  teamId: string;
  userId: string;
  providerId: number;
  service: IntegrationProviderServiceEnum;
  isActive: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  scopes: string | null;
}

/** 'GetIntegrationTokenQuery' query type */
export interface IGetIntegrationTokenQueryQuery {
  params: IGetIntegrationTokenQueryParams;
  result: IGetIntegrationTokenQueryResult;
}

const getIntegrationTokenQueryIR: any = {"name":"getIntegrationTokenQuery","params":[{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":90,"b":95,"line":5,"col":18}]}},{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":113,"b":118,"line":6,"col":16}]}},{"name":"service","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":137,"b":143,"line":7,"col":17}]}}],"usedParamSet":{"teamId":true,"userId":true,"service":true},"statement":{"body":"SELECT * FROM \"IntegrationToken\"\nWHERE \"teamId\" = :teamId\nAND \"userId\" = :userId\nAND \"service\" = :service\nAND \"isActive\" = TRUE","loc":{"a":39,"b":165,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "IntegrationToken"
 * WHERE "teamId" = :teamId
 * AND "userId" = :userId
 * AND "service" = :service
 * AND "isActive" = TRUE
 * ```
 */
export const getIntegrationTokenQuery = new PreparedQuery<IGetIntegrationTokenQueryParams,IGetIntegrationTokenQueryResult>(getIntegrationTokenQueryIR);


