/** Types generated for queries found in "packages/server/postgres/queries/src/getTemplateRefsByIdsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetTemplateRefsByIdsQuery' parameters type */
export interface IGetTemplateRefsByIdsQueryParams {
  ids: readonly (string | null | void)[];
}

/** 'GetTemplateRefsByIdsQuery' return type */
export interface IGetTemplateRefsByIdsQueryResult {
  id: string;
  createdAt: Date | null;
  name: string | null;
  dimensions: Json | null;
}

/** 'GetTemplateRefsByIdsQuery' query type */
export interface IGetTemplateRefsByIdsQueryQuery {
  params: IGetTemplateRefsByIdsQueryParams;
  result: IGetTemplateRefsByIdsQueryResult;
}

const getTemplateRefsByIdsQueryIR: any = {"name":"getTemplateRefsByIdsQuery","params":[{"name":"ids","codeRefs":{"defined":{"a":46,"b":48,"line":3,"col":9},"used":[{"a":226,"b":228,"line":7,"col":17}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"ids":true},"statement":{"body":"SELECT t.\"id\", t.\"createdAt\", s.\"name\", s.\"dimensions\"\nFROM \"TemplateRef\" as t, jsonb_to_record(t.\"template\") as s(\"name\" text, \"dimensions\" json)\nWHERE t.\"id\" in :ids","loc":{"a":62,"b":228,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT t."id", t."createdAt", s."name", s."dimensions"
 * FROM "TemplateRef" as t, jsonb_to_record(t."template") as s("name" text, "dimensions" json)
 * WHERE t."id" in :ids
 * ```
 */
export const getTemplateRefsByIdsQuery = new PreparedQuery<IGetTemplateRefsByIdsQueryParams,IGetTemplateRefsByIdsQueryResult>(getTemplateRefsByIdsQueryIR);


