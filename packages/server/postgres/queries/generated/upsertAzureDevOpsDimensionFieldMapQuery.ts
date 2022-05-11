/** Types generated for queries found in "packages/server/postgres/queries/src/upsertAzureDevOpsDimensionFieldMapQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'UpsertAzureDevOpsDimensionFieldMapQuery' parameters type */
export interface IUpsertAzureDevOpsDimensionFieldMapQueryParams {
  fieldMap: {
    teamId: string | null | void,
    dimensionName: string | null | void,
    fieldName: string | null | void,
    fieldId: string | null | void,
    instanceId: string | null | void,
    fieldType: string | null | void,
    projectKey: string | null | void
  };
}

/** 'UpsertAzureDevOpsDimensionFieldMapQuery' return type */
export type IUpsertAzureDevOpsDimensionFieldMapQueryResult = void;

/** 'UpsertAzureDevOpsDimensionFieldMapQuery' query type */
export interface IUpsertAzureDevOpsDimensionFieldMapQueryQuery {
  params: IUpsertAzureDevOpsDimensionFieldMapQueryParams;
  result: IUpsertAzureDevOpsDimensionFieldMapQueryResult;
}

const upsertAzureDevOpsDimensionFieldMapQueryIR: any = {"name":"upsertAzureDevOpsDimensionFieldMapQuery","params":[{"name":"fieldMap","codeRefs":{"defined":{"a":60,"b":67,"line":3,"col":9},"used":[{"a":298,"b":305,"line":6,"col":8}]},"transform":{"type":"pick_tuple","keys":["teamId","dimensionName","fieldName","fieldId","instanceId","fieldType","projectKey"]}}],"usedParamSet":{"fieldMap":true},"statement":{"body":"INSERT INTO \"AzureDevOpsDimensionFieldMap\" (\"teamId\", \"dimensionName\", \"fieldName\", \"fieldId\", \"instanceId\", \"fieldType\", \"projectKey\")\nVALUES :fieldMap\nON CONFLICT (\"teamId\", \"dimensionName\", \"instanceId\", \"projectKey\")\nDO UPDATE\nSET \"fieldName\" = EXCLUDED.\"fieldName\", \"fieldId\" = EXCLUDED.\"fieldId\", \"fieldType\" = EXCLUDED.\"fieldType\"","loc":{"a":154,"b":490,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "AzureDevOpsDimensionFieldMap" ("teamId", "dimensionName", "fieldName", "fieldId", "instanceId", "fieldType", "projectKey")
 * VALUES :fieldMap
 * ON CONFLICT ("teamId", "dimensionName", "instanceId", "projectKey")
 * DO UPDATE
 * SET "fieldName" = EXCLUDED."fieldName", "fieldId" = EXCLUDED."fieldId", "fieldType" = EXCLUDED."fieldType"
 * ```
 */
export const upsertAzureDevOpsDimensionFieldMapQuery = new PreparedQuery<IUpsertAzureDevOpsDimensionFieldMapQueryParams,IUpsertAzureDevOpsDimensionFieldMapQueryResult>(upsertAzureDevOpsDimensionFieldMapQueryIR);


