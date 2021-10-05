/** Types generated for queries found in "packages/server/postgres/queries/src/getTemplateScaleRefsByIdsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetTemplateScaleRefsByIdsQuery' parameters type */
export interface IGetTemplateScaleRefsByIdsQueryParams {
  scaleRefIds: readonly (string | null | void)[];
}

/** 'GetTemplateScaleRefsByIdsQuery' return type */
export interface IGetTemplateScaleRefsByIdsQueryResult {
  id: string;
  createdAt: Date | null;
  name: string | null;
  values: Json | null;
}

/** 'GetTemplateScaleRefsByIdsQuery' query type */
export interface IGetTemplateScaleRefsByIdsQueryQuery {
  params: IGetTemplateScaleRefsByIdsQueryParams;
  result: IGetTemplateScaleRefsByIdsQueryResult;
}

const getTemplateScaleRefsByIdsQueryIR: any = {"name":"getTemplateScaleRefsByIdsQuery","params":[{"name":"scaleRefIds","codeRefs":{"defined":{"a":51,"b":61,"line":3,"col":9},"used":[{"a":234,"b":244,"line":8,"col":17}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"scaleRefIds":true},"statement":{"body":"SELECT t.\"id\", t.\"createdAt\", s.\"name\", s.\"values\"\nFROM \"TemplateScaleRef\" as t, jsonb_to_record(t.\"scale\") as s(\"name\" text, \"values\" json)\nWHERE t.\"id\" in :scaleRefIds","loc":{"a":76,"b":244,"line":6,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT t."id", t."createdAt", s."name", s."values"
 * FROM "TemplateScaleRef" as t, jsonb_to_record(t."scale") as s("name" text, "values" json)
 * WHERE t."id" in :scaleRefIds
 * ```
 */
export const getTemplateScaleRefsByIdsQuery = new PreparedQuery<IGetTemplateScaleRefsByIdsQueryParams,IGetTemplateScaleRefsByIdsQueryResult>(getTemplateScaleRefsByIdsQueryIR);


