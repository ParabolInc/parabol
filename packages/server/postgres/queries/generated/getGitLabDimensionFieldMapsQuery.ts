/** Types generated for queries found in "packages/server/postgres/queries/src/getGitLabDimensionFieldMapsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetGitLabDimensionFieldMapsQuery' parameters type */
export interface IGetGitLabDimensionFieldMapsQueryParams {
  teamId: string | null | void;
  dimensionName: string | null | void;
  gid: string | null | void;
}

/** 'GetGitLabDimensionFieldMapsQuery' return type */
export interface IGetGitLabDimensionFieldMapsQueryResult {
  id: number;
  teamId: string;
  dimensionName: string;
  gid: string;
  labelTemplate: string;
}

/** 'GetGitLabDimensionFieldMapsQuery' query type */
export interface IGetGitLabDimensionFieldMapsQueryQuery {
  params: IGetGitLabDimensionFieldMapsQueryParams;
  result: IGetGitLabDimensionFieldMapsQueryResult;
}

const getGitLabDimensionFieldMapsQueryIR: any = {"name":"getGitLabDimensionFieldMapsQuery","params":[{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":105,"b":110,"line":5,"col":18}]}},{"name":"dimensionName","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":135,"b":147,"line":5,"col":48}]}},{"name":"gid","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":162,"b":164,"line":5,"col":75}]}}],"usedParamSet":{"teamId":true,"dimensionName":true,"gid":true},"statement":{"body":"SELECT * from \"GitLabDimensionFieldMap\"\nWHERE \"teamId\" = :teamId AND \"dimensionName\" = :dimensionName AND \"gid\" = :gid","loc":{"a":47,"b":164,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * from "GitLabDimensionFieldMap"
 * WHERE "teamId" = :teamId AND "dimensionName" = :dimensionName AND "gid" = :gid
 * ```
 */
export const getGitLabDimensionFieldMapsQuery = new PreparedQuery<IGetGitLabDimensionFieldMapsQueryParams,IGetGitLabDimensionFieldMapsQueryResult>(getGitLabDimensionFieldMapsQueryIR);


