/** Types generated for queries found in "packages/server/postgres/queries/src/getTeamPromptResponsesByIdsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetTeamPromptResponsesByIdsQuery' parameters type */
export interface IGetTeamPromptResponsesByIdsQueryParams {
  ids: readonly (string | null | void)[];
}

/** 'GetTeamPromptResponsesByIdsQuery' return type */
export interface IGetTeamPromptResponsesByIdsQueryResult {
  id: string | null;
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

const getTeamPromptResponsesByIdsQueryIR: any = {"name":"getTeamPromptResponsesByIdsQuery","params":[{"name":"ids","codeRefs":{"defined":{"a":53,"b":55,"line":3,"col":9},"used":[{"a":318,"b":320,"line":6,"col":46}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"ids":true},"statement":{"body":"SELECT CONCAT('teamPromptResponse:', \"id\") as id, \"createdAt\", \"updatedAt\", \"meetingId\", \"userId\", \"sortOrder\", \"content\", \"plaintextContent\", to_json(\"reactjis\") as \"reactjis\" FROM \"TeamPromptResponse\"\nWHERE CONCAT('teamPromptResponse:', \"id\") in :ids","loc":{"a":69,"b":320,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT CONCAT('teamPromptResponse:', "id") as id, "createdAt", "updatedAt", "meetingId", "userId", "sortOrder", "content", "plaintextContent", to_json("reactjis") as "reactjis" FROM "TeamPromptResponse"
 * WHERE CONCAT('teamPromptResponse:', "id") in :ids
 * ```
 */
export const getTeamPromptResponsesByIdsQuery = new PreparedQuery<IGetTeamPromptResponsesByIdsQueryParams,IGetTeamPromptResponsesByIdsQueryResult>(getTeamPromptResponsesByIdsQueryIR);


