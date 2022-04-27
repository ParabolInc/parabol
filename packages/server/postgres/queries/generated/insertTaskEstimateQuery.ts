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
  githubLabelName: string | null | void;
  azureDevOpsFieldlName: string | null | void;
}

/** 'InsertTaskEstimateQuery' return type */
export type IInsertTaskEstimateQueryResult = void;

/** 'InsertTaskEstimateQuery' query type */
export interface IInsertTaskEstimateQueryQuery {
  params: IInsertTaskEstimateQueryParams;
  result: IInsertTaskEstimateQueryResult;
}

const insertTaskEstimateQueryIR: any = {"name":"insertTaskEstimateQuery","params":[{"name":"changeSource","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":254,"b":265,"line":17,"col":3}]}},{"name":"name","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":271,"b":274,"line":18,"col":3}]}},{"name":"label","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":280,"b":284,"line":19,"col":3}]}},{"name":"taskId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":290,"b":295,"line":20,"col":3}]}},{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":301,"b":306,"line":21,"col":3}]}},{"name":"meetingId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":312,"b":320,"line":22,"col":3}]}},{"name":"stageId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":326,"b":332,"line":23,"col":3}]}},{"name":"discussionId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":338,"b":349,"line":24,"col":3}]}},{"name":"jiraFieldId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":355,"b":365,"line":25,"col":3}]}},{"name":"githubLabelName","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":371,"b":385,"line":26,"col":3}]}},{"name":"azureDevOpsFieldlName","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":391,"b":411,"line":27,"col":3}]}}],"usedParamSet":{"changeSource":true,"name":true,"label":true,"taskId":true,"userId":true,"meetingId":true,"stageId":true,"discussionId":true,"jiraFieldId":true,"githubLabelName":true,"azureDevOpsFieldlName":true},"statement":{"body":"INSERT INTO \"TaskEstimate\" (\n  \"changeSource\",\n  \"name\",\n  \"label\",\n  \"taskId\",\n  \"userId\",\n  \"meetingId\",\n  \"stageId\",\n  \"discussionId\",\n  \"jiraFieldId\",\n  \"githubLabelName\",\n  \"azureDevOpsFieldlName\"\n) VALUES (\n  :changeSource,\n  :name,\n  :label,\n  :taskId,\n  :userId,\n  :meetingId,\n  :stageId,\n  :discussionId,\n  :jiraFieldId,\n  :githubLabelName,\n  :azureDevOpsFieldlName\n)","loc":{"a":38,"b":413,"line":4,"col":0}}};

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
 *   "jiraFieldId",
 *   "githubLabelName",
 *   "azureDevOpsFieldlName"
 * ) VALUES (
 *   :changeSource,
 *   :name,
 *   :label,
 *   :taskId,
 *   :userId,
 *   :meetingId,
 *   :stageId,
 *   :discussionId,
 *   :jiraFieldId,
 *   :githubLabelName,
 *   :azureDevOpsFieldlName
 * )
 * ```
 */
export const insertTaskEstimateQuery = new PreparedQuery<IInsertTaskEstimateQueryParams,IInsertTaskEstimateQueryResult>(insertTaskEstimateQueryIR);


