/** Types generated for queries found in "packages/server/postgres/queries/src/getJiraServerDimensionFieldMapQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetJiraServerDimensionFieldMapQuery' parameters type */
export interface IGetJiraServerDimensionFieldMapQueryParams {
  providerId: number | null | void;
  teamId: string | null | void;
  projectId: string | null | void;
  issueType: string | null | void;
  dimensionName: string | null | void;
}

/** 'GetJiraServerDimensionFieldMapQuery' return type */
export interface IGetJiraServerDimensionFieldMapQueryResult {
  id: number;
  providerId: number;
  teamId: string;
  dimensionName: string;
  projectId: string;
  issueType: string;
  fieldId: string;
  fieldName: string;
  fieldType: string;
}

/** 'GetJiraServerDimensionFieldMapQuery' query type */
export interface IGetJiraServerDimensionFieldMapQueryQuery {
  params: IGetJiraServerDimensionFieldMapQueryParams;
  result: IGetJiraServerDimensionFieldMapQueryResult;
}

const getJiraServerDimensionFieldMapQueryIR: any = {"name":"getJiraServerDimensionFieldMapQuery","params":[{"name":"providerId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":115,"b":124,"line":5,"col":21}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":142,"b":147,"line":5,"col":48}]}},{"name":"projectId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":168,"b":176,"line":5,"col":74}]}},{"name":"issueType","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":197,"b":205,"line":5,"col":103}]}},{"name":"dimensionName","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":230,"b":242,"line":5,"col":136}]}}],"usedParamSet":{"providerId":true,"teamId":true,"projectId":true,"issueType":true,"dimensionName":true},"statement":{"body":"SELECT * from \"JiraServerDimensionFieldMap\"\nWHERE \"providerId\"= :providerId AND \"teamId\" = :teamId AND \"projectId\" = :projectId AND \"issueType\" = :issueType AND \"dimensionName\" = :dimensionName","loc":{"a":50,"b":242,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * from "JiraServerDimensionFieldMap"
 * WHERE "providerId"= :providerId AND "teamId" = :teamId AND "projectId" = :projectId AND "issueType" = :issueType AND "dimensionName" = :dimensionName
 * ```
 */
export const getJiraServerDimensionFieldMapQuery = new PreparedQuery<IGetJiraServerDimensionFieldMapQueryParams,IGetJiraServerDimensionFieldMapQueryResult>(getJiraServerDimensionFieldMapQueryIR);


