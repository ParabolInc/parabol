/** Types generated for queries found in "packages/server/postgres/queries/src/getGitHubDimensionFieldMapsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetGitHubDimensionFieldMapsQuery' parameters type */
export interface IGetGitHubDimensionFieldMapsQueryParams {
  teamId: string | null | void;
  dimensionName: string | null | void;
  nameWithOwner: string | null | void;
}

/** 'GetGitHubDimensionFieldMapsQuery' return type */
export interface IGetGitHubDimensionFieldMapsQueryResult {
  id: number;
  teamId: string;
  dimensionName: string;
  nameWithOwner: string;
  labelTemplate: string;
}

/** 'GetGitHubDimensionFieldMapsQuery' query type */
export interface IGetGitHubDimensionFieldMapsQueryQuery {
  params: IGetGitHubDimensionFieldMapsQueryParams;
  result: IGetGitHubDimensionFieldMapsQueryResult;
}

const getGitHubDimensionFieldMapsQueryIR: any = {"name":"getGitHubDimensionFieldMapsQuery","params":[{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":105,"b":110,"line":5,"col":18}]}},{"name":"dimensionName","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":135,"b":147,"line":5,"col":48}]}},{"name":"nameWithOwner","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":172,"b":184,"line":5,"col":85}]}}],"usedParamSet":{"teamId":true,"dimensionName":true,"nameWithOwner":true},"statement":{"body":"SELECT * from \"GitHubDimensionFieldMap\"\nWHERE \"teamId\" = :teamId AND \"dimensionName\" = :dimensionName AND \"nameWithOwner\" = :nameWithOwner","loc":{"a":47,"b":184,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * from "GitHubDimensionFieldMap"
 * WHERE "teamId" = :teamId AND "dimensionName" = :dimensionName AND "nameWithOwner" = :nameWithOwner
 * ```
 */
export const getGitHubDimensionFieldMapsQuery = new PreparedQuery<IGetGitHubDimensionFieldMapsQueryParams,IGetGitHubDimensionFieldMapsQueryResult>(getGitHubDimensionFieldMapsQueryIR);


