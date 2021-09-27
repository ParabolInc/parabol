/** Types generated for queries found in "packages/server/postgres/queries/src/upsertGitHubDimensionFieldMapQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'UpsertGitHubDimensionFieldMapQuery' parameters type */
export interface IUpsertGitHubDimensionFieldMapQueryParams {
  fieldMap: {
    teamId: string | null | void,
    dimensionName: string | null | void,
    nameWithOwner: string | null | void,
    labelTemplate: string | null | void
  };
}

/** 'UpsertGitHubDimensionFieldMapQuery' return type */
export type IUpsertGitHubDimensionFieldMapQueryResult = void;

/** 'UpsertGitHubDimensionFieldMapQuery' query type */
export interface IUpsertGitHubDimensionFieldMapQueryQuery {
  params: IUpsertGitHubDimensionFieldMapQueryParams;
  result: IUpsertGitHubDimensionFieldMapQueryResult;
}

const upsertGitHubDimensionFieldMapQueryIR: any = {"name":"upsertGitHubDimensionFieldMapQuery","params":[{"name":"fieldMap","codeRefs":{"defined":{"a":55,"b":62,"line":3,"col":9},"used":[{"a":232,"b":239,"line":6,"col":8}]},"transform":{"type":"pick_tuple","keys":["teamId","dimensionName","nameWithOwner","labelTemplate"]}}],"usedParamSet":{"fieldMap":true},"statement":{"body":"INSERT INTO \"GitHubDimensionFieldMap\" (\"teamId\", \"dimensionName\", \"nameWithOwner\", \"labelTemplate\")\nVALUES :fieldMap\nON CONFLICT (\"teamId\", \"dimensionName\", \"nameWithOwner\")\nDO UPDATE\nSET \"labelTemplate\" = EXCLUDED.\"labelTemplate\"","loc":{"a":124,"b":353,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "GitHubDimensionFieldMap" ("teamId", "dimensionName", "nameWithOwner", "labelTemplate")
 * VALUES :fieldMap
 * ON CONFLICT ("teamId", "dimensionName", "nameWithOwner")
 * DO UPDATE
 * SET "labelTemplate" = EXCLUDED."labelTemplate"
 * ```
 */
export const upsertGitHubDimensionFieldMapQuery = new PreparedQuery<IUpsertGitHubDimensionFieldMapQueryParams,IUpsertGitHubDimensionFieldMapQueryResult>(upsertGitHubDimensionFieldMapQueryIR);


