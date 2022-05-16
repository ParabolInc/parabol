/** Types generated for queries found in "packages/server/postgres/queries/src/getAzureDevOpsDimensionFieldMapsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetAzureDevOpsDimensionFieldMapsQuery' parameters type */
export interface IGetAzureDevOpsDimensionFieldMapsQueryParams {
  teamId: string | null | void;
  dimensionName: string | null | void;
  instanceId: string | null | void;
  projectKey: string | null | void;
}

/** 'GetAzureDevOpsDimensionFieldMapsQuery' return type */
export interface IGetAzureDevOpsDimensionFieldMapsQueryResult {
  id: number;
  teamId: string;
  dimensionName: string;
  fieldName: string;
  fieldId: string;
  instanceId: string;
  fieldType: string;
  projectKey: string;
}

/** 'GetAzureDevOpsDimensionFieldMapsQuery' query type */
export interface IGetAzureDevOpsDimensionFieldMapsQueryQuery {
  params: IGetAzureDevOpsDimensionFieldMapsQueryParams;
  result: IGetAzureDevOpsDimensionFieldMapsQueryResult;
}

const getAzureDevOpsDimensionFieldMapsQueryIR: any = {"name":"getAzureDevOpsDimensionFieldMapsQuery","params":[{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":115,"b":120,"line":5,"col":18}]}},{"name":"dimensionName","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":145,"b":157,"line":5,"col":48}]}},{"name":"instanceId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":179,"b":188,"line":5,"col":82}]}},{"name":"projectKey","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":210,"b":219,"line":5,"col":113}]}}],"usedParamSet":{"teamId":true,"dimensionName":true,"instanceId":true,"projectKey":true},"statement":{"body":"SELECT * from \"AzureDevOpsDimensionFieldMap\"\nWHERE \"teamId\" = :teamId AND \"dimensionName\" = :dimensionName AND \"instanceId\" = :instanceId AND \"projectKey\" = :projectKey","loc":{"a":52,"b":219,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * from "AzureDevOpsDimensionFieldMap"
 * WHERE "teamId" = :teamId AND "dimensionName" = :dimensionName AND "instanceId" = :instanceId AND "projectKey" = :projectKey
 * ```
 */
export const getAzureDevOpsDimensionFieldMapsQuery = new PreparedQuery<IGetAzureDevOpsDimensionFieldMapsQueryParams,IGetAzureDevOpsDimensionFieldMapsQueryResult>(getAzureDevOpsDimensionFieldMapsQueryIR);


