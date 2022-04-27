/** Types generated for queries found in "packages/server/postgres/queries/src/getSimilarTaskEstimateQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type ChangeSourceEnum = 'external' | 'meeting' | 'task';

/** 'GetSimilarTaskEstimateQuery' parameters type */
export interface IGetSimilarTaskEstimateQueryParams {
  taskIds: readonly (string | null | void)[];
  labelNames: readonly (string | null | void)[];
  dimensionName: string | null | void;
}

/** 'GetSimilarTaskEstimateQuery' return type */
export interface IGetSimilarTaskEstimateQueryResult {
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

/** 'GetSimilarTaskEstimateQuery' query type */
export interface IGetSimilarTaskEstimateQueryQuery {
  params: IGetSimilarTaskEstimateQueryParams;
  result: IGetSimilarTaskEstimateQueryResult;
}

const getSimilarTaskEstimateQueryIR: any = {"name":"getSimilarTaskEstimateQuery","params":[{"name":"taskIds","codeRefs":{"defined":{"a":48,"b":54,"line":3,"col":9},"used":[{"a":145,"b":151,"line":7,"col":19}]},"transform":{"type":"array_spread"}},{"name":"labelNames","codeRefs":{"defined":{"a":74,"b":83,"line":4,"col":9},"used":[{"a":207,"b":216,"line":9,"col":26}]},"transform":{"type":"array_spread"}},{"name":"dimensionName","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":167,"b":179,"line":8,"col":14}]}}],"usedParamSet":{"taskIds":true,"dimensionName":true,"labelNames":true},"statement":{"body":"SELECT * FROM \"TaskEstimate\"\nWHERE \"taskId\" in :taskIds\nAND \"name\" = :dimensionName\nAND \"githubLabelName\" in :labelNames\nLIMIT 1","loc":{"a":97,"b":224,"line":6,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "TaskEstimate"
 * WHERE "taskId" in :taskIds
 * AND "name" = :dimensionName
 * AND "githubLabelName" in :labelNames
 * LIMIT 1
 * ```
 */
export const getSimilarTaskEstimateQuery = new PreparedQuery<IGetSimilarTaskEstimateQueryParams,IGetSimilarTaskEstimateQueryResult>(getSimilarTaskEstimateQueryIR);


