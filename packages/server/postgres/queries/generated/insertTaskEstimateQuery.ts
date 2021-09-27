/** Types generated for queries found in "packages/server/postgres/queries/src/insertTaskEstimateQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type ChangeSourceEnum = 'external' | 'meeting' | 'task';

/** 'InsertTaskEstimateQuery' parameters type */
export interface IInsertTaskEstimateQueryParams {
  changeSource: ChangeSourceEnum | null | void;
  name: string | null | void;
  label: string | null | void;
  taskId: string | null | void;
  userId: string | null | void;
  meetingId: string | null | void;
  stageId: string | null | void;
  discussionId: string | null | void;
  jiraFieldId: string | null | void;
}

/** 'InsertTaskEstimateQuery' return type */
export type IInsertTaskEstimateQueryResult = void;

/** 'InsertTaskEstimateQuery' query type */
export interface IInsertTaskEstimateQueryQuery {
  params: IInsertTaskEstimateQueryParams;
  result: IInsertTaskEstimateQueryResult;
}

const insertTaskEstimateQueryIR: any = {"name":"insertTaskEstimateQuery","params":[{"name":"changeSource","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":206,"b":217,"line":15,"col":3}]}},{"name":"name","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":223,"b":226,"line":16,"col":3}]}},{"name":"label","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":232,"b":236,"line":17,"col":3}]}},{"name":"taskId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":242,"b":247,"line":18,"col":3}]}},{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":253,"b":258,"line":19,"col":3}]}},{"name":"meetingId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":264,"b":272,"line":20,"col":3}]}},{"name":"stageId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":278,"b":284,"line":21,"col":3}]}},{"name":"discussionId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":290,"b":301,"line":22,"col":3}]}},{"name":"jiraFieldId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":307,"b":317,"line":23,"col":3}]}}],"usedParamSet":{"changeSource":true,"name":true,"label":true,"taskId":true,"userId":true,"meetingId":true,"stageId":true,"discussionId":true,"jiraFieldId":true},"statement":{"body":"INSERT INTO \"TaskEstimate\" (\n  \"changeSource\",\n  \"name\",\n  \"label\",\n  \"taskId\",\n  \"userId\",\n  \"meetingId\",\n  \"stageId\",\n  \"discussionId\",\n  \"jiraFieldId\"\n) VALUES (\n  :changeSource,\n  :name,\n  :label,\n  :taskId,\n  :userId,\n  :meetingId,\n  :stageId,\n  :discussionId,\n  :jiraFieldId\n)","loc":{"a":38,"b":319,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "TaskEstimate" (
 *   "changeSource",
 *   "name",
 *   "label",
 *   "taskId",
 *   "userId",
 *   "meetingId",
 *   "stageId",
 *   "discussionId",
 *   "jiraFieldId"
 * ) VALUES (
 *   :changeSource,
 *   :name,
 *   :label,
 *   :taskId,
 *   :userId,
 *   :meetingId,
 *   :stageId,
 *   :discussionId,
 *   :jiraFieldId
 * )
 * ```
 */
export const insertTaskEstimateQuery = new PreparedQuery<IInsertTaskEstimateQueryParams,IInsertTaskEstimateQueryResult>(insertTaskEstimateQueryIR);


