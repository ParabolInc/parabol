/** Types generated for queries found in "packages/server/postgres/queries/src/getAzureDevOpsAuthByUserIdTeamIdQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type JsonArray = (null | boolean | number | string | Json[] | { [key: string]: Json })[];

export type stringArray = (string)[];

/** 'GetAzureDevOpsAuthByUserIdTeamIdQuery' parameters type */
export interface IGetAzureDevOpsAuthByUserIdTeamIdQueryParams {
  userId: string | null | void;
  teamId: string | null | void;
}

/** 'GetAzureDevOpsAuthByUserIdTeamIdQuery' return type */
export interface IGetAzureDevOpsAuthByUserIdTeamIdQueryResult {
  accessToken: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  azureDevOpsSearchQueries: JsonArray;
  cloudIds: stringArray;
  scope: string;
  accountId: string;
  teamId: string;
  userId: string;
}

/** 'GetAzureDevOpsAuthByUserIdTeamIdQuery' query type */
export interface IGetAzureDevOpsAuthByUserIdTeamIdQueryQuery {
  params: IGetAzureDevOpsAuthByUserIdTeamIdQueryParams;
  result: IGetAzureDevOpsAuthByUserIdTeamIdQueryResult;
}

const getAzureDevOpsAuthByUserIdTeamIdQueryIR: any = {"name":"getAzureDevOpsAuthByUserIdTeamIdQuery","params":[{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":102,"b":107,"line":5,"col":18}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":125,"b":130,"line":5,"col":41}]}}],"usedParamSet":{"userId":true,"teamId":true},"statement":{"body":"SELECT * from \"AzureDevOpsAuth\"\nWHERE \"userId\" = :userId AND \"teamId\" = :teamId AND \"isActive\" = TRUE","loc":{"a":52,"b":152,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * from "AzureDevOpsAuth"
 * WHERE "userId" = :userId AND "teamId" = :teamId AND "isActive" = TRUE
 * ```
 */
export const getAzureDevOpsAuthByUserIdTeamIdQuery = new PreparedQuery<IGetAzureDevOpsAuthByUserIdTeamIdQueryParams,IGetAzureDevOpsAuthByUserIdTeamIdQueryResult>(getAzureDevOpsAuthByUserIdTeamIdQueryIR);


