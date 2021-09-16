/** Types generated for queries found in "packages/server/postgres/queries/src/insertPollWithOptionsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'InsertPollWithOptionsQuery' parameters type */
export interface IInsertPollWithOptionsQueryParams {
  poll: {
    createdById: string | null | void,
    discussionId: string | null | void,
    teamId: string | null | void,
    meetingId: string | null | void,
    threadSortOrder: number | null | void,
    title: string | null | void
  };
  pollOptions: readonly ({
    title: string | null | void
  })[];
}

/** 'InsertPollWithOptionsQuery' return type */
export interface IInsertPollWithOptionsQueryResult {
  pollId: number;
}

/** 'InsertPollWithOptionsQuery' query type */
export interface IInsertPollWithOptionsQueryQuery {
  params: IInsertPollWithOptionsQueryParams;
  result: IInsertPollWithOptionsQueryResult;
}

const insertPollWithOptionsQueryIR: any = {"name":"insertPollWithOptionsQuery","params":[{"name":"poll","codeRefs":{"defined":{"a":47,"b":50,"line":3,"col":9},"used":[{"a":341,"b":344,"line":14,"col":13}]},"transform":{"type":"pick_tuple","keys":["createdById","discussionId","teamId","meetingId","threadSortOrder","title"]}},{"name":"pollOptions","codeRefs":{"defined":{"a":135,"b":145,"line":4,"col":9},"used":[{"a":448,"b":458,"line":16,"col":66}]},"transform":{"type":"pick_array_spread","keys":["title"]}}],"usedParamSet":{"poll":true,"pollOptions":true},"statement":{"body":"WITH poll AS (\n   INSERT INTO \"Poll\" (\n       \"createdById\",\n       \"discussionId\",\n       \"teamId\",\n       \"meetingId\",\n       \"threadSortOrder\",\n       \"title\"\n   ) VALUES :poll RETURNING *\n), pollOptionsData AS (\n  SELECT \"title\", (SELECT id from poll AS \"pollId\") FROM (VALUES :pollOptions) AS pollOptionsData(title) \n)\nINSERT INTO \"PollOption\" (\"title\", \"pollId\")\n  SELECT * FROM pollOptionsData\nRETURNING \"pollId\"","loc":{"a":166,"b":584,"line":6,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH poll AS (
 *    INSERT INTO "Poll" (
 *        "createdById",
 *        "discussionId",
 *        "teamId",
 *        "meetingId",
 *        "threadSortOrder",
 *        "title"
 *    ) VALUES :poll RETURNING *
 * ), pollOptionsData AS (
 *   SELECT "title", (SELECT id from poll AS "pollId") FROM (VALUES :pollOptions) AS pollOptionsData(title) 
 * )
 * INSERT INTO "PollOption" ("title", "pollId")
 *   SELECT * FROM pollOptionsData
 * RETURNING "pollId"
 * ```
 */
export const insertPollWithOptionsQuery = new PreparedQuery<IInsertPollWithOptionsQueryParams,IInsertPollWithOptionsQueryResult>(insertPollWithOptionsQueryIR);


