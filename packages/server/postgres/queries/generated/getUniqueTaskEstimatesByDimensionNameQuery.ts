/** Types generated for queries found in "packages/server/postgres/queries/src/getUniqueTaskEstimatesByDimensionNameQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type ChangeSourceEnum = 'external' | 'meeting' | 'task';

/** 'GetUniqueTaskEstimatesByDimensionNameQuery' parameters type */
export interface IGetUniqueTaskEstimatesByDimensionNameQueryParams {
  nameWithOwner: string | null | void;
  teamId: string | null | void;
  dimensionName: string | null | void;
}

/** 'GetUniqueTaskEstimatesByDimensionNameQuery' return type */
export interface IGetUniqueTaskEstimatesByDimensionNameQueryResult {
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
}

/** 'GetUniqueTaskEstimatesByDimensionNameQuery' query type */
export interface IGetUniqueTaskEstimatesByDimensionNameQueryQuery {
  params: IGetUniqueTaskEstimatesByDimensionNameQueryParams;
  result: IGetUniqueTaskEstimatesByDimensionNameQueryResult;
}

const getUniqueTaskEstimatesByDimensionNameQueryIR: any = {"name":"getUniqueTaskEstimatesByDimensionNameQuery","params":[{"name":"nameWithOwner","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":286,"b":298,"line":7,"col":54}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":346,"b":351,"line":8,"col":46}]}},{"name":"dimensionName","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":384,"b":396,"line":9,"col":31}]}}],"usedParamSet":{"nameWithOwner":true,"teamId":true,"dimensionName":true},"statement":{"body":"SELECT DISTINCT ON (\"label\") \"TaskEstimate\".* FROM \"TaskEstimate\"\nLEFT JOIN \"GitHubDimensionFieldMap\"\n    ON \"GitHubDimensionFieldMap\".\"dimensionName\" = \"TaskEstimate\".\"name\"\n    AND  \"GitHubDimensionFieldMap\".\"nameWithOwner\" = :nameWithOwner\n    AND \"GitHubDimensionFieldMap\".\"teamId\" = :teamId\nWHERE \"TaskEstimate\".\"name\" = :dimensionName\nAND \"TaskEstimate\".\"githubLabelName\" IS NOT NULL","loc":{"a":57,"b":445,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT DISTINCT ON ("label") "TaskEstimate".* FROM "TaskEstimate"
 * LEFT JOIN "GitHubDimensionFieldMap"
 *     ON "GitHubDimensionFieldMap"."dimensionName" = "TaskEstimate"."name"
 *     AND  "GitHubDimensionFieldMap"."nameWithOwner" = :nameWithOwner
 *     AND "GitHubDimensionFieldMap"."teamId" = :teamId
 * WHERE "TaskEstimate"."name" = :dimensionName
 * AND "TaskEstimate"."githubLabelName" IS NOT NULL
 * ```
 */
export const getUniqueTaskEstimatesByDimensionNameQuery = new PreparedQuery<IGetUniqueTaskEstimatesByDimensionNameQueryParams,IGetUniqueTaskEstimatesByDimensionNameQueryResult>(getUniqueTaskEstimatesByDimensionNameQueryIR);


