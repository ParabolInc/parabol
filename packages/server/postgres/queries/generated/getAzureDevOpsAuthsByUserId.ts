/** Types generated for queries found in "packages/server/postgres/queries/src/getAzureDevOpsAuthsByUserId.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderServiceEnum = 'azureDevOps' | 'gitlab' | 'jiraServer' | 'mattermost';

/** 'GetAzureDevOpsAuthsByUserIdQuery' parameters type */
export interface IGetAzureDevOpsAuthsByUserIdQueryParams {
  userId: string | null | void;
}

/** 'GetAzureDevOpsAuthsByUserIdQuery' return type */
export interface IGetAzureDevOpsAuthsByUserIdQueryResult {
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

/** 'GetAzureDevOpsAuthsByUserIdQuery' query type */
export interface IGetAzureDevOpsAuthsByUserIdQueryQuery {
  params: IGetAzureDevOpsAuthsByUserIdQueryParams;
  result: IGetAzureDevOpsAuthsByUserIdQueryResult;
}

const getAzureDevOpsAuthsByUserIdQueryIR: any = {"name":"getAzureDevOpsAuthsByUserIdQuery","params":[{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":107,"b":112,"line":5,"col":18}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT * from \"TeamMemberIntegrationAuth\"\nWHERE \"userId\" = :userId AND \"isActive\" = TRUE","loc":{"a":47,"b":134,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * from "TeamMemberIntegrationAuth"
 * WHERE "userId" = :userId AND "isActive" = TRUE
 * ```
 */
export const getAzureDevOpsAuthsByUserIdQuery = new PreparedQuery<IGetAzureDevOpsAuthsByUserIdQueryParams,IGetAzureDevOpsAuthsByUserIdQueryResult>(getAzureDevOpsAuthsByUserIdQueryIR);


