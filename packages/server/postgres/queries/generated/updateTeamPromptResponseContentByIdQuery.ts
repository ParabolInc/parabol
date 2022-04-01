/** Types generated for queries found in "packages/server/postgres/queries/src/updateTeamPromptResponseContentByIdQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'UpdateTeamPromptResponseContentByIdQuery' parameters type */
export interface IUpdateTeamPromptResponseContentByIdQueryParams {
  content: Json | null | void;
  plaintextContent: string | null | void;
  id: number | null | void;
}

/** 'UpdateTeamPromptResponseContentByIdQuery' return type */
export type IUpdateTeamPromptResponseContentByIdQueryResult = void;

/** 'UpdateTeamPromptResponseContentByIdQuery' query type */
export interface IUpdateTeamPromptResponseContentByIdQueryQuery {
  params: IUpdateTeamPromptResponseContentByIdQueryParams;
  result: IUpdateTeamPromptResponseContentByIdQueryResult;
}

const updateTeamPromptResponseContentByIdQueryIR: any = {"name":"updateTeamPromptResponseContentByIdQuery","params":[{"name":"content","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":103,"b":109,"line":6,"col":15}]}},{"name":"plaintextContent","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":136,"b":151,"line":7,"col":24}]}},{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":167,"b":168,"line":8,"col":14}]}}],"usedParamSet":{"content":true,"plaintextContent":true,"id":true},"statement":{"body":"UPDATE \"TeamPromptResponse\" SET\n  \"content\" = :content,\n  \"plaintextContent\" = :plaintextContent\nWHERE \"id\" = :id","loc":{"a":56,"b":168,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "TeamPromptResponse" SET
 *   "content" = :content,
 *   "plaintextContent" = :plaintextContent
 * WHERE "id" = :id
 * ```
 */
export const updateTeamPromptResponseContentByIdQuery = new PreparedQuery<IUpdateTeamPromptResponseContentByIdQueryParams,IUpdateTeamPromptResponseContentByIdQueryResult>(updateTeamPromptResponseContentByIdQueryIR);


