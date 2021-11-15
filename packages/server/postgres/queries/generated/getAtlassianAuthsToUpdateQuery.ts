/** Types generated for queries found in "packages/server/postgres/queries/src/getAtlassianAuthsToUpdateQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type JsonArray = (null | boolean | number | string | Json[] | { [key: string]: Json })[];

export type stringArray = (string)[];

/** 'GetAtlassianAuthsToUpdateQuery' parameters type */
export interface IGetAtlassianAuthsToUpdateQueryParams {
  updatedAtThreshold: Date | null | void;
}

/** 'GetAtlassianAuthsToUpdateQuery' return type */
export interface IGetAtlassianAuthsToUpdateQueryResult {
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

/** 'GetAtlassianAuthsToUpdateQuery' query type */
export interface IGetAtlassianAuthsToUpdateQueryQuery {
  params: IGetAtlassianAuthsToUpdateQueryParams;
  result: IGetAtlassianAuthsToUpdateQueryResult;
}

const getAtlassianAuthsToUpdateQueryIR: any = {"name":"getAtlassianAuthsToUpdateQuery","params":[{"name":"updatedAtThreshold","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":97,"b":114,"line":5,"col":22}]}}],"usedParamSet":{"updatedAtThreshold":true},"statement":{"body":"SELECT * from \"AtlassianAuth\"\nWHERE \"updatedAt\" <= :updatedAtThreshold","loc":{"a":45,"b":114,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * from "AtlassianAuth"
 * WHERE "updatedAt" <= :updatedAtThreshold
 * ```
 */
export const getAtlassianAuthsToUpdateQuery = new PreparedQuery<IGetAtlassianAuthsToUpdateQueryParams,IGetAtlassianAuthsToUpdateQueryResult>(getAtlassianAuthsToUpdateQueryIR);


