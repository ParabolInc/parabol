/** Types generated for queries found in "packages/server/postgres/queries/src/getGitHubDimensionFieldMapsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetGitHubDimensionFieldMapsQuery' parameters type */
export interface IGetGitHubDimensionFieldMapsQueryParams {
  keys: Array<{
    teamId: string | null | void,
    dimensionName: string | null | void,
    nameWithOwner: string | null | void
  }>;
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

const getGitHubDimensionFieldMapsQueryIR: any = {"name":"getGitHubDimensionFieldMapsQuery","params":[{"name":"keys","codeRefs":{"defined":{"a":53,"b":56,"line":3,"col":9},"used":[{"a":220,"b":223,"line":10,"col":56}]},"transform":{"type":"pick_array_spread","keys":["teamId","dimensionName","nameWithOwner"]}}],"usedParamSet":{"keys":true},"statement":{"body":"SELECT * from \"GitHubDimensionFieldMap\"\nWHERE (\"teamId\", \"dimensionName\", \"nameWithOwner\") in (:keys)","loc":{"a":124,"b":224,"line":9,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * from "GitHubDimensionFieldMap"
 * WHERE ("teamId", "dimensionName", "nameWithOwner") in (:keys)
 * ```
 */
export const getGitHubDimensionFieldMapsQuery = new PreparedQuery<IGetGitHubDimensionFieldMapsQueryParams,IGetGitHubDimensionFieldMapsQueryResult>(getGitHubDimensionFieldMapsQueryIR);


