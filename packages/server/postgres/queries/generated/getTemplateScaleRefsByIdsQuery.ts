/** Types generated for queries found in "packages/server/postgres/queries/src/getTemplateScaleRefsByIdsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetTemplateScaleRefsByIdsQuery' parameters type */
export interface IGetTemplateScaleRefsByIdsQueryParams {
  ids: readonly (string | null | void)[];
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

const getTemplateScaleRefsByIdsQueryIR: any = {"name":"getTemplateScaleRefsByIdsQuery","params":[{"name":"ids","codeRefs":{"defined":{"a":51,"b":53,"line":3,"col":9},"used":[{"a":226,"b":228,"line":8,"col":17}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"ids":true},"statement":{"body":"SELECT t.\"id\", t.\"createdAt\", s.\"name\", s.\"values\"\nFROM \"TemplateScaleRef\" as t, jsonb_to_record(t.\"scale\") as s(\"name\" text, \"values\" json)\nWHERE t.\"id\" in :ids","loc":{"a":68,"b":228,"line":6,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT t."id", t."createdAt", s."name", s."values"
 * FROM "TemplateScaleRef" as t, jsonb_to_record(t."scale") as s("name" text, "values" json)
 * WHERE t."id" in :ids
 * ```
 */
export const getTemplateScaleRefsByIdsQuery = new PreparedQuery<IGetTemplateScaleRefsByIdsQueryParams,IGetTemplateScaleRefsByIdsQueryResult>(getTemplateScaleRefsByIdsQueryIR);


