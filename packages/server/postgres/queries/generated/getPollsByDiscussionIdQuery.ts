/** Types generated for queries found in "packages/server/postgres/queries/src/getPollsByDiscussionIdQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetPollsByDiscussionIdQuery' parameters type */
export interface IGetPollsByDiscussionIdQueryParams {
  discussionIds: readonly (string | null | void)[];
}

/** 'GetPollsByDiscussionIdQuery' return type */
export interface IGetPollsByDiscussionIdQueryResult {
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

/** 'GetPollsByDiscussionIdQuery' query type */
export interface IGetPollsByDiscussionIdQueryQuery {
  params: IGetPollsByDiscussionIdQueryParams;
  result: IGetPollsByDiscussionIdQueryResult;
}

const getPollsByDiscussionIdQueryIR: any = {"name":"getPollsByDiscussionIdQuery","params":[{"name":"discussionIds","codeRefs":{"defined":{"a":48,"b":60,"line":3,"col":9},"used":[{"a":120,"b":132,"line":6,"col":25}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"discussionIds":true},"statement":{"body":"SELECT * FROM \"Poll\"\nWHERE \"discussionId\" in :discussionIds","loc":{"a":74,"b":132,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "Poll"
 * WHERE "discussionId" in :discussionIds
 * ```
 */
export const getPollsByDiscussionIdQuery = new PreparedQuery<IGetPollsByDiscussionIdQueryParams,IGetPollsByDiscussionIdQueryResult>(getPollsByDiscussionIdQueryIR);


