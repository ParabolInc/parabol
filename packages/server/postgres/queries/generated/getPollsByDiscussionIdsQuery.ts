/** Types generated for queries found in "packages/server/postgres/queries/src/getPollsByDiscussionIdsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetPollsByDiscussionIdsQuery' parameters type */
export interface IGetPollsByDiscussionIdsQueryParams {
  discussionIds: readonly (string | null | void)[];
}

/** 'GetPollsByDiscussionIdsQuery' return type */
export interface IGetPollsByDiscussionIdsQueryResult {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  endedAt: Date | null;
  createdById: string;
  discussionId: string;
  teamId: string;
  threadSortOrder: number;
  meetingId: string | null;
  title: string | null;
}

/** 'GetPollsByDiscussionIdsQuery' query type */
export interface IGetPollsByDiscussionIdsQueryQuery {
  params: IGetPollsByDiscussionIdsQueryParams;
  result: IGetPollsByDiscussionIdsQueryResult;
}

const getPollsByDiscussionIdsQueryIR: any = {"name":"getPollsByDiscussionIdsQuery","params":[{"name":"discussionIds","codeRefs":{"defined":{"a":49,"b":61,"line":3,"col":9},"used":[{"a":121,"b":133,"line":6,"col":25}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"discussionIds":true},"statement":{"body":"SELECT * FROM \"Poll\"\nWHERE \"discussionId\" in :discussionIds","loc":{"a":75,"b":133,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "Poll"
 * WHERE "discussionId" in :discussionIds
 * ```
 */
export const getPollsByDiscussionIdsQuery = new PreparedQuery<IGetPollsByDiscussionIdsQueryParams,IGetPollsByDiscussionIdsQueryResult>(getPollsByDiscussionIdsQueryIR);


