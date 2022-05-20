/** Types generated for queries found in "packages/server/postgres/queries/src/getBestTeamIntegrationAuthQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderServiceEnum = 'azureDevOps' | 'gitlab' | 'jiraServer' | 'mattermost' | 'msTeams';

/** 'GetBestTeamIntegrationAuthQuery' parameters type */
export interface IGetBestTeamIntegrationAuthQueryParams {
  userId: string | null | void;
  teamId: string | null | void;
  service: IntegrationProviderServiceEnum | null | void;
}

/** 'GetBestTeamIntegrationAuthQuery' return type */
export interface IGetBestTeamIntegrationAuthQueryResult {
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
  accessTokenSecret: string | null;
  isUser: boolean | null;
}

/** 'GetBestTeamIntegrationAuthQuery' query type */
export interface IGetBestTeamIntegrationAuthQueryQuery {
  params: IGetBestTeamIntegrationAuthQueryParams;
  result: IGetBestTeamIntegrationAuthQueryResult;
}

const getBestTeamIntegrationAuthQueryIR: any = {"name":"getBestTeamIntegrationAuthQuery","params":[{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":68,"b":73,"line":4,"col":22}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":138,"b":143,"line":5,"col":18}]}},{"name":"service","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":162,"b":168,"line":6,"col":17}]}}],"usedParamSet":{"userId":true,"teamId":true,"service":true},"statement":{"body":"SELECT *, \"userId\" = :userId as \"isUser\" FROM \"TeamMemberIntegrationAuth\"\nWHERE \"teamId\" = :teamId\nAND \"service\" = :service\nAND \"isActive\" = TRUE\nORDER BY \"isUser\" DESC, \"updatedAt\" DESC\nLIMIT 1","loc":{"a":46,"b":239,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT *, "userId" = :userId as "isUser" FROM "TeamMemberIntegrationAuth"
 * WHERE "teamId" = :teamId
 * AND "service" = :service
 * AND "isActive" = TRUE
 * ORDER BY "isUser" DESC, "updatedAt" DESC
 * LIMIT 1
 * ```
 */
export const getBestTeamIntegrationAuthQuery = new PreparedQuery<IGetBestTeamIntegrationAuthQueryParams,IGetBestTeamIntegrationAuthQueryResult>(getBestTeamIntegrationAuthQueryIR);


