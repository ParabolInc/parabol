/** Types generated for queries found in "packages/server/postgres/queries/src/upsertTeamPromptResponseQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'UpsertTeamPromptResponseQuery' parameters type */
export interface IUpsertTeamPromptResponseQueryParams {
  responses: readonly ({
    meetingId: string | null | void,
    userId: string | null | void,
    sortOrder: number | null | void,
    content: Json | null | void,
    plaintextContent: string | null | void
  })[];
}

/** 'UpsertTeamPromptResponseQuery' return type */
export type IUpsertTeamPromptResponseQueryResult = void;

/** 'UpsertTeamPromptResponseQuery' query type */
export interface IUpsertTeamPromptResponseQueryQuery {
  params: IUpsertTeamPromptResponseQueryParams;
  result: IUpsertTeamPromptResponseQueryResult;
}

const upsertTeamPromptResponseQueryIR: any = {"name":"upsertTeamPromptResponseQuery","params":[{"name":"responses","codeRefs":{"defined":{"a":50,"b":58,"line":3,"col":9},"used":[{"a":238,"b":246,"line":6,"col":8}]},"transform":{"type":"pick_array_spread","keys":["meetingId","userId","sortOrder","content","plaintextContent"]}}],"usedParamSet":{"responses":true},"statement":{"body":"INSERT INTO \"TeamPromptResponse\" (\"meetingId\", \"userId\", \"sortOrder\", \"content\", \"plaintextContent\")\nVALUES :responses","loc":{"a":129,"b":246,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "TeamPromptResponse" ("meetingId", "userId", "sortOrder", "content", "plaintextContent")
 * VALUES :responses
 * ```
 */
export const upsertTeamPromptResponseQuery = new PreparedQuery<IUpsertTeamPromptResponseQueryParams,IUpsertTeamPromptResponseQueryResult>(upsertTeamPromptResponseQueryIR);


