/** Types generated for queries found in "packages/server/postgres/queries/src/getAtlassianAuthByUserId.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type JsonArray = (null | boolean | number | string | Json[] | { [key: string]: Json })[];

export type stringArray = (string)[];

/** 'GetAtlassianAuthByUserIdQuery' parameters type */
export interface IGetAtlassianAuthByUserIdQueryParams {
  userId: string | null | void;
}

/** 'GetAtlassianAuthByUserIdQuery' return type */
export interface IGetAtlassianAuthByUserIdQueryResult {
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

/** 'GetAtlassianAuthByUserIdQuery' query type */
export interface IGetAtlassianAuthByUserIdQueryQuery {
  params: IGetAtlassianAuthByUserIdQueryParams;
  result: IGetAtlassianAuthByUserIdQueryResult;
}

const getAtlassianAuthByUserIdQueryIR: any = {"name":"getAtlassianAuthByUserIdQuery","params":[{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":92,"b":97,"line":5,"col":18}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT * from \"AtlassianAuth\"\nWHERE \"userId\" = :userId AND \"isActive\" = TRUE","loc":{"a":44,"b":119,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * from "AtlassianAuth"
 * WHERE "userId" = :userId AND "isActive" = TRUE
 * ```
 */
export const getAtlassianAuthByUserIdQuery = new PreparedQuery<IGetAtlassianAuthByUserIdQueryParams,IGetAtlassianAuthByUserIdQueryResult>(getAtlassianAuthByUserIdQueryIR);


