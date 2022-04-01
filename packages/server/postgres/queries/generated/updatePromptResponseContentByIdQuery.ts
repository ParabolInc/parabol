/** Types generated for queries found in "packages/server/postgres/queries/src/updatePromptResponseContentByIdQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'UpdatePromptResponseContentByIdQuery' parameters type */
export interface IUpdatePromptResponseContentByIdQueryParams {
  content: Json | null | void;
  id: number | null | void;
}

/** 'UpdatePromptResponseContentByIdQuery' return type */
export type IUpdatePromptResponseContentByIdQueryResult = void;

/** 'UpdatePromptResponseContentByIdQuery' query type */
export interface IUpdatePromptResponseContentByIdQueryQuery {
  params: IUpdatePromptResponseContentByIdQueryParams;
  result: IUpdatePromptResponseContentByIdQueryResult;
}

const updatePromptResponseContentByIdQueryIR: any = {"name":"updatePromptResponseContentByIdQuery","params":[{"name":"content","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":99,"b":105,"line":6,"col":15}]}},{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":121,"b":122,"line":7,"col":14}]}}],"usedParamSet":{"content":true,"id":true},"statement":{"body":"UPDATE \"TeamPromptResponse\" SET\n  \"content\" = :content\nWHERE \"id\" = :id","loc":{"a":52,"b":122,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "TeamPromptResponse" SET
 *   "content" = :content
 * WHERE "id" = :id
 * ```
 */
export const updatePromptResponseContentByIdQuery = new PreparedQuery<IUpdatePromptResponseContentByIdQueryParams,IUpdatePromptResponseContentByIdQueryResult>(updatePromptResponseContentByIdQueryIR);


