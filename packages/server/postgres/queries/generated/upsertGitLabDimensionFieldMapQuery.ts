/** Types generated for queries found in "packages/server/postgres/queries/src/upsertGitLabDimensionFieldMapQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'UpsertGitLabDimensionFieldMapQuery' parameters type */
export interface IUpsertGitLabDimensionFieldMapQueryParams {
  fieldMap: {
    teamId: string | null | void,
    dimensionName: string | null | void,
    projectId: number | null | void,
    providerId: number | null | void,
    labelTemplate: string | null | void
  };
}

/** 'UpsertGitLabDimensionFieldMapQuery' return type */
export type IUpsertGitLabDimensionFieldMapQueryResult = void;

/** 'UpsertGitLabDimensionFieldMapQuery' query type */
export interface IUpsertGitLabDimensionFieldMapQueryQuery {
  params: IUpsertGitLabDimensionFieldMapQueryParams;
  result: IUpsertGitLabDimensionFieldMapQueryResult;
}

const upsertGitLabDimensionFieldMapQueryIR: any = {"name":"upsertGitLabDimensionFieldMapQuery","params":[{"name":"fieldMap","codeRefs":{"defined":{"a":55,"b":62,"line":3,"col":9},"used":[{"a":250,"b":257,"line":6,"col":8}]},"transform":{"type":"pick_tuple","keys":["teamId","dimensionName","projectId","providerId","labelTemplate"]}}],"usedParamSet":{"fieldMap":true},"statement":{"body":"INSERT INTO \"GitLabDimensionFieldMap\" (\"teamId\", \"dimensionName\", \"projectId\", \"providerId\", \"labelTemplate\")\nVALUES :fieldMap\nON CONFLICT (\"teamId\", \"dimensionName\", \"projectId\", \"providerId\")\nDO UPDATE\nSET \"labelTemplate\" = EXCLUDED.\"labelTemplate\"","loc":{"a":132,"b":381,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "GitLabDimensionFieldMap" ("teamId", "dimensionName", "projectId", "providerId", "labelTemplate")
 * VALUES :fieldMap
 * ON CONFLICT ("teamId", "dimensionName", "projectId", "providerId")
 * DO UPDATE
 * SET "labelTemplate" = EXCLUDED."labelTemplate"
 * ```
 */
export const upsertGitLabDimensionFieldMapQuery = new PreparedQuery<IUpsertGitLabDimensionFieldMapQueryParams,IUpsertGitLabDimensionFieldMapQueryResult>(upsertGitLabDimensionFieldMapQueryIR);


