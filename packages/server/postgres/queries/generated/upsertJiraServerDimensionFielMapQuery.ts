/** Types generated for queries found in "packages/server/postgres/queries/src/upsertJiraServerDimensionFielMapQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'UpsertJiraServerDimensionFieldMapQuery' parameters type */
export interface IUpsertJiraServerDimensionFieldMapQueryParams {
  fieldMap: {
    providerId: number | null | void,
    teamId: string | null | void,
    projectId: string | null | void,
    issueType: string | null | void,
    dimensionName: string | null | void,
    fieldId: string | null | void,
    fieldName: string | null | void,
    fieldType: string | null | void
  };
}

/** 'UpsertJiraServerDimensionFieldMapQuery' return type */
export type IUpsertJiraServerDimensionFieldMapQueryResult = void;

/** 'UpsertJiraServerDimensionFieldMapQuery' query type */
export interface IUpsertJiraServerDimensionFieldMapQueryQuery {
  params: IUpsertJiraServerDimensionFieldMapQueryParams;
  result: IUpsertJiraServerDimensionFieldMapQueryResult;
}

const upsertJiraServerDimensionFieldMapQueryIR: any = {"name":"upsertJiraServerDimensionFieldMapQuery","params":[{"name":"fieldMap","codeRefs":{"defined":{"a":59,"b":66,"line":3,"col":9},"used":[{"a":318,"b":325,"line":6,"col":8}]},"transform":{"type":"pick_tuple","keys":["providerId","teamId","projectId","issueType","dimensionName","fieldId","fieldName","fieldType"]}}],"usedParamSet":{"fieldMap":true},"statement":{"body":"INSERT INTO \"JiraServerDimensionFieldMap\" (\"providerId\", \"teamId\", \"projectId\", \"issueType\", \"dimensionName\", \"fieldId\", \"fieldName\", \"fieldType\")\nVALUES :fieldMap\nON CONFLICT (\"providerId\", \"teamId\", \"projectId\", \"issueType\", \"dimensionName\")\nDO UPDATE SET\n  \"fieldId\" = EXCLUDED.\"fieldId\",\n  \"fieldName\" = EXCLUDED.\"fieldName\",\n  \"fieldType\" = EXCLUDED.\"fieldType\"","loc":{"a":163,"b":528,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "JiraServerDimensionFieldMap" ("providerId", "teamId", "projectId", "issueType", "dimensionName", "fieldId", "fieldName", "fieldType")
 * VALUES :fieldMap
 * ON CONFLICT ("providerId", "teamId", "projectId", "issueType", "dimensionName")
 * DO UPDATE SET
 *   "fieldId" = EXCLUDED."fieldId",
 *   "fieldName" = EXCLUDED."fieldName",
 *   "fieldType" = EXCLUDED."fieldType"
 * ```
 */
export const upsertJiraServerDimensionFieldMapQuery = new PreparedQuery<IUpsertJiraServerDimensionFieldMapQueryParams,IUpsertJiraServerDimensionFieldMapQueryResult>(upsertJiraServerDimensionFieldMapQueryIR);


