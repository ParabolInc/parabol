/** Types generated for queries found in "packages/server/postgres/queries/src/getTemplateRefsByIdQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetTemplateRefsByIdQuery' parameters type */
export interface IGetTemplateRefsByIdQueryParams {
  refIds: readonly (string | null | void)[];
}

/** 'GetTemplateRefsByIdQuery' return type */
export interface IGetTemplateRefsByIdQueryResult {
  id: string;
  createdAt: Date | null;
  name: string | null;
  dimensions: Json | null;
}

/** 'GetTemplateRefsByIdQuery' query type */
export interface IGetTemplateRefsByIdQueryQuery {
  params: IGetTemplateRefsByIdQueryParams;
  result: IGetTemplateRefsByIdQueryResult;
}

const getTemplateRefsByIdQueryIR: any = {"name":"getTemplateRefsByIdQuery","params":[{"name":"refIds","codeRefs":{"defined":{"a":45,"b":50,"line":3,"col":9},"used":[{"a":228,"b":233,"line":7,"col":17}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"refIds":true},"statement":{"body":"SELECT t.\"id\", t.\"createdAt\", s.\"name\", s.\"dimensions\"\nFROM \"TemplateRef\" as t, jsonb_to_record(t.\"template\") as s(\"name\" text, \"dimensions\" json)\nWHERE t.\"id\" in :refIds","loc":{"a":64,"b":233,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT t."id", t."createdAt", s."name", s."dimensions"
 * FROM "TemplateRef" as t, jsonb_to_record(t."template") as s("name" text, "dimensions" json)
 * WHERE t."id" in :refIds
 * ```
 */
export const getTemplateRefsByIdQuery = new PreparedQuery<IGetTemplateRefsByIdQueryParams,IGetTemplateRefsByIdQueryResult>(getTemplateRefsByIdQueryIR);


