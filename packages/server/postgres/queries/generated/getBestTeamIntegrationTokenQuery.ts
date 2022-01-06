/** Types generated for queries found in "packages/server/postgres/queries/src/getBestTeamIntegrationTokenQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderServiceEnum = 'gitlab' | 'mattermost';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetBestTeamIntegrationTokenQuery' parameters type */
export interface IGetBestTeamIntegrationTokenQueryParams {
  userId: string | null | void;
  teamId: string | null | void;
  service: IntegrationProviderServiceEnum | null | void;
}

/** 'GetBestTeamIntegrationTokenQuery' return type */
export interface IGetBestTeamIntegrationTokenQueryResult {
  createdAt: Date;
  updatedAt: Date;
  teamId: string;
  userId: string;
  providerId: number;
  service: IntegrationProviderServiceEnum;
  isActive: boolean;
  tokenMetadata: Json;
  isUser: boolean | null;
}

/** 'GetBestTeamIntegrationTokenQuery' query type */
export interface IGetBestTeamIntegrationTokenQueryQuery {
  params: IGetBestTeamIntegrationTokenQueryParams;
  result: IGetBestTeamIntegrationTokenQueryResult;
}

const getBestTeamIntegrationTokenQueryIR: any = {"name":"getBestTeamIntegrationTokenQuery","params":[{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":69,"b":74,"line":4,"col":22}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":130,"b":135,"line":5,"col":18}]}},{"name":"service","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":154,"b":160,"line":6,"col":17}]}}],"usedParamSet":{"userId":true,"teamId":true,"service":true},"statement":{"body":"SELECT *, \"userId\" = :userId as \"isUser\" FROM \"IntegrationToken\"\nWHERE \"teamId\" = :teamId\nAND \"service\" = :service\nAND \"isActive\" = TRUE\nORDER BY \"isUser\" DESC, \"updatedAt\" DESC\nLIMIT 1","loc":{"a":47,"b":231,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT *, "userId" = :userId as "isUser" FROM "IntegrationToken"
 * WHERE "teamId" = :teamId
 * AND "service" = :service
 * AND "isActive" = TRUE
 * ORDER BY "isUser" DESC, "updatedAt" DESC
 * LIMIT 1
 * ```
 */
export const getBestTeamIntegrationTokenQuery = new PreparedQuery<IGetBestTeamIntegrationTokenQueryParams,IGetBestTeamIntegrationTokenQueryResult>(getBestTeamIntegrationTokenQueryIR);


