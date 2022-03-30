/** Types generated for queries found in "packages/server/postgres/queries/src/getAzureDevOpsAuthByUserIdTeamIdQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderServiceEnum = 'azureDevOps' | 'gitlab' | 'jiraServer' | 'mattermost';

/** 'GetAzureDevOpsAuthByUserIdTeamIdQuery' parameters type */
export interface IGetAzureDevOpsAuthByUserIdTeamIdQueryParams {
  userId: string | null | void;
  teamId: string | null | void;
}

/** 'GetAzureDevOpsAuthByUserIdTeamIdQuery' return type */
export interface IGetAzureDevOpsAuthByUserIdTeamIdQueryResult {
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
}

/** 'GetAzureDevOpsAuthByUserIdTeamIdQuery' query type */
export interface IGetAzureDevOpsAuthByUserIdTeamIdQueryQuery {
  params: IGetAzureDevOpsAuthByUserIdTeamIdQueryParams;
  result: IGetAzureDevOpsAuthByUserIdTeamIdQueryResult;
}

const getAzureDevOpsAuthByUserIdTeamIdQueryIR: any = {"name":"getAzureDevOpsAuthByUserIdTeamIdQuery","params":[{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":112,"b":117,"line":5,"col":18}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":135,"b":140,"line":5,"col":41}]}}],"usedParamSet":{"userId":true,"teamId":true},"statement":{"body":"SELECT * from \"TeamMemberIntegrationAuth\"\nWHERE \"userId\" = :userId AND \"teamId\" = :teamId AND \"isActive\" = TRUE","loc":{"a":52,"b":162,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * from "TeamMemberIntegrationAuth"
 * WHERE "userId" = :userId AND "teamId" = :teamId AND "isActive" = TRUE
 * ```
 */
export const getAzureDevOpsAuthByUserIdTeamIdQuery = new PreparedQuery<IGetAzureDevOpsAuthByUserIdTeamIdQueryParams,IGetAzureDevOpsAuthByUserIdTeamIdQueryResult>(getAzureDevOpsAuthByUserIdTeamIdQueryIR);


