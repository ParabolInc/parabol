/** Types generated for queries found in "packages/server/postgres/queries/src/getAzureDevOpsAuthsByUserId.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type JsonArray = (null | boolean | number | string | Json[] | { [key: string]: Json })[];

export type stringArray = (string)[];

/** 'GetAzureDevOpsAuthsByUserIdQuery' parameters type */
export interface IGetAzureDevOpsAuthsByUserIdQueryParams {
  userId: string | null | void;
}

/** 'GetAzureDevOpsAuthsByUserIdQuery' return type */
export interface IGetAzureDevOpsAuthsByUserIdQueryResult {
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

/** 'GetAzureDevOpsAuthsByUserIdQuery' query type */
export interface IGetAzureDevOpsAuthsByUserIdQueryQuery {
  params: IGetAzureDevOpsAuthsByUserIdQueryParams;
  result: IGetAzureDevOpsAuthsByUserIdQueryResult;
}

const getAzureDevOpsAuthsByUserIdQueryIR: any = {"name":"getAzureDevOpsAuthsByUserIdQuery","params":[{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":97,"b":102,"line":5,"col":18}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT * from \"AzureDevOpsAuth\"\nWHERE \"userId\" = :userId AND \"isActive\" = TRUE","loc":{"a":47,"b":124,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * from "AzureDevOpsAuth"
 * WHERE "userId" = :userId AND "isActive" = TRUE
 * ```
 */
export const getAzureDevOpsAuthsByUserIdQuery = new PreparedQuery<IGetAzureDevOpsAuthsByUserIdQueryParams,IGetAzureDevOpsAuthsByUserIdQueryResult>(getAzureDevOpsAuthsByUserIdQueryIR);


