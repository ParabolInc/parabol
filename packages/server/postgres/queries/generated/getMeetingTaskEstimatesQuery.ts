/** Types generated for queries found in "packages/server/postgres/queries/src/getMeetingTaskEstimatesQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type ChangeSourceEnum = 'external' | 'meeting' | 'task';

/** 'GetMeetingTaskEstimatesQuery' parameters type */
export interface IGetMeetingTaskEstimatesQueryParams {
  taskIds: readonly (string | null | void)[];
  meetingIds: readonly (string | null | void)[];
}

/** 'GetMeetingTaskEstimatesQuery' return type */
export interface IGetMeetingTaskEstimatesQueryResult {
  id: number;
  createdAt: Date;
  changeSource: ChangeSourceEnum;
  name: string;
  label: string;
  taskId: string;
  userId: string;
  meetingId: string | null;
  stageId: string | null;
  discussionId: string | null;
  jiraFieldId: string | null;
  githubLabelName: string | null;
  azureDevOpsFieldlName: string | null;
}

/** 'GetMeetingTaskEstimatesQuery' query type */
export interface IGetMeetingTaskEstimatesQueryQuery {
  params: IGetMeetingTaskEstimatesQueryParams;
  result: IGetMeetingTaskEstimatesQueryResult;
}

const getMeetingTaskEstimatesQueryIR: any = {"name":"getMeetingTaskEstimatesQuery","params":[{"name":"taskIds","codeRefs":{"defined":{"a":49,"b":55,"line":3,"col":9},"used":[{"a":207,"b":213,"line":8,"col":17}]},"transform":{"type":"array_spread"}},{"name":"meetingIds","codeRefs":{"defined":{"a":75,"b":84,"line":4,"col":9},"used":[{"a":179,"b":188,"line":7,"col":22}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"meetingIds":true,"taskIds":true},"statement":{"body":"SELECT DISTINCT ON(\"taskId\", \"name\") * From \"TaskEstimate\"\nWHERE \"meetingId\" in :meetingIds\nAND \"taskId\" in :taskIds\nORDER BY \"taskId\", \"name\", \"createdAt\" desc","loc":{"a":98,"b":257,"line":6,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT DISTINCT ON("taskId", "name") * From "TaskEstimate"
 * WHERE "meetingId" in :meetingIds
 * AND "taskId" in :taskIds
 * ORDER BY "taskId", "name", "createdAt" desc
 * ```
 */
export const getMeetingTaskEstimatesQuery = new PreparedQuery<IGetMeetingTaskEstimatesQueryParams,IGetMeetingTaskEstimatesQueryResult>(getMeetingTaskEstimatesQueryIR);


