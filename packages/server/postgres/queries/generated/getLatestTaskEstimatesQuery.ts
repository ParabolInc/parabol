/** Types generated for queries found in "packages/server/postgres/queries/src/getLatestTaskEstimatesQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type ChangeSourceEnum = 'external' | 'meeting' | 'task';

/** 'GetLatestTaskEstimatesQuery' parameters type */
export interface IGetLatestTaskEstimatesQueryParams {
  taskIds: readonly (string | null | void)[];
}

/** 'GetLatestTaskEstimatesQuery' return type */
export interface IGetLatestTaskEstimatesQueryResult {
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

/** 'GetLatestTaskEstimatesQuery' query type */
export interface IGetLatestTaskEstimatesQueryQuery {
  params: IGetLatestTaskEstimatesQueryParams;
  result: IGetLatestTaskEstimatesQueryResult;
}

const getLatestTaskEstimatesQueryIR: any = {"name":"getLatestTaskEstimatesQuery","params":[{"name":"taskIds","codeRefs":{"defined":{"a":48,"b":54,"line":3,"col":9},"used":[{"a":146,"b":152,"line":6,"col":19}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"taskIds":true},"statement":{"body":"SELECT DISTINCT ON(\"taskId\", \"name\") * From \"TaskEstimate\"\nWHERE \"taskId\" in :taskIds\nORDER BY \"taskId\", \"name\", \"createdAt\" desc","loc":{"a":68,"b":196,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT DISTINCT ON("taskId", "name") * From "TaskEstimate"
 * WHERE "taskId" in :taskIds
 * ORDER BY "taskId", "name", "createdAt" desc
 * ```
 */
export const getLatestTaskEstimatesQuery = new PreparedQuery<IGetLatestTaskEstimatesQueryParams,IGetLatestTaskEstimatesQueryResult>(getLatestTaskEstimatesQueryIR);


