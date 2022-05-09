/** Types generated for queries found in "packages/server/postgres/queries/src/getTeamPromptResponsesByMeetingIdQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetTeamPromptResponsesByMeetingIdQuery' parameters type */
export interface IGetTeamPromptResponsesByMeetingIdQueryParams {
  meetingIds: readonly (string | null | void)[];
}

/** 'GetTeamPromptResponsesByMeetingIdQuery' return type */
export interface IGetTeamPromptResponsesByMeetingIdQueryResult {
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

/** 'GetTeamPromptResponsesByMeetingIdQuery' query type */
export interface IGetTeamPromptResponsesByMeetingIdQueryQuery {
  params: IGetTeamPromptResponsesByMeetingIdQueryParams;
  result: IGetTeamPromptResponsesByMeetingIdQueryResult;
}

const getTeamPromptResponsesByMeetingIdQueryIR: any = {"name":"getTeamPromptResponsesByMeetingIdQuery","params":[{"name":"meetingIds","codeRefs":{"defined":{"a":59,"b":68,"line":3,"col":9},"used":[{"a":307,"b":316,"line":6,"col":22}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"meetingIds":true},"statement":{"body":"SELECT CONCAT('teamPromptResponse:', \"id\") as id, \"createdAt\", \"updatedAt\", \"meetingId\", \"userId\", \"sortOrder\", \"content\", \"plaintextContent\", to_json(\"reactjis\") as \"reactjis\" FROM \"TeamPromptResponse\"\nWHERE \"meetingId\" in :meetingIds","loc":{"a":82,"b":316,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT CONCAT('teamPromptResponse:', "id") as id, "createdAt", "updatedAt", "meetingId", "userId", "sortOrder", "content", "plaintextContent", to_json("reactjis") as "reactjis" FROM "TeamPromptResponse"
 * WHERE "meetingId" in :meetingIds
 * ```
 */
export const getTeamPromptResponsesByMeetingIdQuery = new PreparedQuery<IGetTeamPromptResponsesByMeetingIdQueryParams,IGetTeamPromptResponsesByMeetingIdQueryResult>(getTeamPromptResponsesByMeetingIdQueryIR);


