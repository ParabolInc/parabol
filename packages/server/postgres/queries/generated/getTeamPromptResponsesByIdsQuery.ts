/** Types generated for queries found in "packages/server/postgres/queries/src/getTeamPromptResponsesByIdsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetTeamPromptResponsesByIdsQuery' parameters type */
export interface IGetTeamPromptResponsesByIdsQueryParams {
  ids: readonly (number | null | void)[];
}

/** 'GetTeamPromptResponsesByIdsQuery' return type */
export interface IGetTeamPromptResponsesByIdsQueryResult {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  meetingId: string;
  userId: string;
  sortOrder: number;
  content: Json;
  plaintextContent: string;
  reactjis: Json | null;
}

/** 'GetTeamPromptResponsesByIdsQuery' query type */
export interface IGetTeamPromptResponsesByIdsQueryQuery {
  params: IGetTeamPromptResponsesByIdsQueryParams;
  result: IGetTeamPromptResponsesByIdsQueryResult;
}

const getTeamPromptResponsesByIdsQueryIR: any = {"name":"getTeamPromptResponsesByIdsQuery","params":[{"name":"ids","codeRefs":{"defined":{"a":53,"b":55,"line":3,"col":9},"used":[{"a":248,"b":250,"line":6,"col":13}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"ids":true},"statement":{"body":"SELECT \"id\", \"createdAt\", \"updatedAt\", \"meetingId\", \"userId\", \"sortOrder\", \"content\", \"plaintextContent\", to_json(\"reactjis\") as \"reactjis\" FROM \"TeamPromptResponse\"\nWHERE id in :ids","loc":{"a":69,"b":250,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "createdAt", "updatedAt", "meetingId", "userId", "sortOrder", "content", "plaintextContent", to_json("reactjis") as "reactjis" FROM "TeamPromptResponse"
 * WHERE id in :ids
 * ```
 */
export const getTeamPromptResponsesByIdsQuery = new PreparedQuery<IGetTeamPromptResponsesByIdsQueryParams,IGetTeamPromptResponsesByIdsQueryResult>(getTeamPromptResponsesByIdsQueryIR);


