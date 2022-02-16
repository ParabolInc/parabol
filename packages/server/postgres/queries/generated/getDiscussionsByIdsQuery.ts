/** Types generated for queries found in "packages/server/postgres/queries/src/getDiscussionsByIdsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type DiscussionTopicTypeEnum = 'agendaItem' | 'githubIssue' | 'jiraIssue' | 'reflectionGroup' | 'task' | 'teamPromptResponse';

/** 'GetDiscussionsByIdsQuery' parameters type */
export interface IGetDiscussionsByIdsQueryParams {
  ids: readonly (string | null | void)[];
}

/** 'GetDiscussionsByIdsQuery' return type */
export interface IGetDiscussionsByIdsQueryResult {
  id: string;
  createdAt: Date;
  teamId: string;
  meetingId: string;
  discussionTopicId: string;
  discussionTopicType: DiscussionTopicTypeEnum;
}

/** 'GetDiscussionsByIdsQuery' query type */
export interface IGetDiscussionsByIdsQueryQuery {
  params: IGetDiscussionsByIdsQueryParams;
  result: IGetDiscussionsByIdsQueryResult;
}

const getDiscussionsByIdsQueryIR: any = {"name":"getDiscussionsByIdsQuery","params":[{"name":"ids","codeRefs":{"defined":{"a":45,"b":47,"line":3,"col":9},"used":[{"a":101,"b":103,"line":6,"col":13}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"ids":true},"statement":{"body":"SELECT * FROM \"Discussion\"\nWHERE id in :ids","loc":{"a":61,"b":103,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "Discussion"
 * WHERE id in :ids
 * ```
 */
export const getDiscussionsByIdsQuery = new PreparedQuery<IGetDiscussionsByIdsQueryParams,IGetDiscussionsByIdsQueryResult>(getDiscussionsByIdsQueryIR);


