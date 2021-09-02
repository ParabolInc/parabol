/** Types generated for queries found in "packages/server/postgres/queries/src/insertPollQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'InsertPollQuery' parameters type */
export interface IInsertPollQueryParams {
  createdById: string | null | void;
  discussionId: string | null | void;
  teamId: string | null | void;
  meetingId: string | null | void;
  threadSortOrder: number | null | void;
  title: string | null | void;
}

/** 'InsertPollQuery' return type */
export interface IInsertPollQueryResult {
  id: number;
}

/** 'InsertPollQuery' query type */
export interface IInsertPollQueryQuery {
  params: IInsertPollQueryParams;
  result: IInsertPollQueryResult;
}

const insertPollQueryIR: any = {"name":"insertPollQuery","params":[{"name":"createdById","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":158,"b":168,"line":12,"col":3}]}},{"name":"discussionId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":174,"b":185,"line":13,"col":3}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":191,"b":196,"line":14,"col":3}]}},{"name":"meetingId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":202,"b":210,"line":15,"col":3}]}},{"name":"threadSortOrder","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":216,"b":230,"line":16,"col":3}]}},{"name":"title","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":236,"b":240,"line":17,"col":3}]}}],"usedParamSet":{"createdById":true,"discussionId":true,"teamId":true,"meetingId":true,"threadSortOrder":true,"title":true},"statement":{"body":"INSERT INTO \"Poll\" (\n  \"createdById\",\n  \"discussionId\",\n  \"teamId\",\n  \"meetingId\",\n  \"threadSortOrder\",\n  \"title\"\n) VALUES (\n  :createdById,\n  :discussionId,\n  :teamId,\n  :meetingId,\n  :threadSortOrder,\n  :title\n) RETURNING \"id\"","loc":{"a":30,"b":257,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "Poll" (
 *   "createdById",
 *   "discussionId",
 *   "teamId",
 *   "meetingId",
 *   "threadSortOrder",
 *   "title"
 * ) VALUES (
 *   :createdById,
 *   :discussionId,
 *   :teamId,
 *   :meetingId,
 *   :threadSortOrder,
 *   :title
 * ) RETURNING "id"
 * ```
 */
export const insertPollQuery = new PreparedQuery<IInsertPollQueryParams,IInsertPollQueryResult>(insertPollQueryIR);


