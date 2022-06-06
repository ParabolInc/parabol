/** Types generated for queries found in "packages/server/postgres/queries/src/getTeamMemberIntegrationAuthQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderServiceEnum = 'azureDevOps' | 'gitlab' | 'jiraServer' | 'mattermost' | 'msTeams';

/** 'GetTeamMemberIntegrationAuthQuery' parameters type */
export interface IGetTeamMemberIntegrationAuthQueryParams {
  teamId: string | null | void;
  userId: string | null | void;
  service: IntegrationProviderServiceEnum | null | void;
}

/** 'GetTeamMemberIntegrationAuthQuery' return type */
export interface IGetTeamMemberIntegrationAuthQueryResult {
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
  expiresAt: Date | null;
}

/** 'GetTeamMemberIntegrationAuthQuery' query type */
export interface IGetTeamMemberIntegrationAuthQueryQuery {
  params: IGetTeamMemberIntegrationAuthQueryParams;
  result: IGetTeamMemberIntegrationAuthQueryResult;
}

const getTeamMemberIntegrationAuthQueryIR: any = {"name":"getTeamMemberIntegrationAuthQuery","params":[{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":108,"b":113,"line":5,"col":18}]}},{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":131,"b":136,"line":6,"col":16}]}},{"name":"service","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":155,"b":161,"line":7,"col":17}]}}],"usedParamSet":{"teamId":true,"userId":true,"service":true},"statement":{"body":"SELECT * FROM \"TeamMemberIntegrationAuth\"\nWHERE \"teamId\" = :teamId\nAND \"userId\" = :userId\nAND \"service\" = :service\nAND \"isActive\" = TRUE","loc":{"a":48,"b":183,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "TeamMemberIntegrationAuth"
 * WHERE "teamId" = :teamId
 * AND "userId" = :userId
 * AND "service" = :service
 * AND "isActive" = TRUE
 * ```
 */
export const getTeamMemberIntegrationAuthQuery = new PreparedQuery<IGetTeamMemberIntegrationAuthQueryParams,IGetTeamMemberIntegrationAuthQueryResult>(getTeamMemberIntegrationAuthQueryIR);


