/** Types generated for queries found in "packages/server/postgres/queries/src/getAtlassianAuthsByUserId.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type JsonArray = (null | boolean | number | string | Json[] | { [key: string]: Json })[];

export type stringArray = (string)[];

/** 'GetAtlassianAuthsByUserIdQuery' parameters type */
export interface IGetAtlassianAuthsByUserIdQueryParams {
  userId: string | null | void;
}

/** 'GetAtlassianAuthsByUserIdQuery' return type */
export interface IGetAtlassianAuthsByUserIdQueryResult {
  accessToken: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  jiraSearchQueries: JsonArray;
  cloudIds: stringArray;
  scope: string;
  accountId: string;
  teamId: string;
  userId: string;
}

/** 'GetAtlassianAuthsByUserIdQuery' query type */
export interface IGetAtlassianAuthsByUserIdQueryQuery {
  params: IGetAtlassianAuthsByUserIdQueryParams;
  result: IGetAtlassianAuthsByUserIdQueryResult;
}

const getAtlassianAuthsByUserIdQueryIR: any = {"name":"getAtlassianAuthsByUserIdQuery","params":[{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":93,"b":98,"line":5,"col":18}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT * from \"AtlassianAuth\"\nWHERE \"userId\" = :userId AND \"isActive\" = TRUE","loc":{"a":45,"b":120,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * from "AtlassianAuth"
 * WHERE "userId" = :userId AND "isActive" = TRUE
 * ```
 */
export const getAtlassianAuthsByUserIdQuery = new PreparedQuery<IGetAtlassianAuthsByUserIdQueryParams,IGetAtlassianAuthsByUserIdQueryResult>(getAtlassianAuthsByUserIdQueryIR);


