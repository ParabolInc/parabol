/** Types generated for queries found in "packages/server/postgres/queries/src/upsertTeamPromptResponsesQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'UpsertTeamPromptResponsesQuery' parameters type */
export interface IUpsertTeamPromptResponsesQueryParams {
  responses: readonly ({
    meetingId: string | null | void,
    userId: string | null | void,
    sortOrder: number | null | void,
    content: Json | null | void,
    plaintextContent: string | null | void
  })[];
}

/** 'UpsertTeamPromptResponsesQuery' return type */
export type IUpsertTeamPromptResponsesQueryResult = void;

/** 'UpsertTeamPromptResponsesQuery' query type */
export interface IUpsertTeamPromptResponsesQueryQuery {
  params: IUpsertTeamPromptResponsesQueryParams;
  result: IUpsertTeamPromptResponsesQueryResult;
}

const upsertTeamPromptResponsesQueryIR: any = {"name":"upsertTeamPromptResponsesQuery","params":[{"name":"responses","codeRefs":{"defined":{"a":51,"b":59,"line":3,"col":9},"used":[{"a":239,"b":247,"line":6,"col":8}]},"transform":{"type":"pick_array_spread","keys":["meetingId","userId","sortOrder","content","plaintextContent"]}}],"usedParamSet":{"responses":true},"statement":{"body":"INSERT INTO \"TeamPromptResponse\" (\"meetingId\", \"userId\", \"sortOrder\", \"content\", \"plaintextContent\")\nVALUES :responses","loc":{"a":130,"b":247,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "TeamPromptResponse" ("meetingId", "userId", "sortOrder", "content", "plaintextContent")
 * VALUES :responses
 * ```
 */
export const upsertTeamPromptResponsesQuery = new PreparedQuery<IUpsertTeamPromptResponsesQueryParams,IUpsertTeamPromptResponsesQueryResult>(upsertTeamPromptResponsesQueryIR);


