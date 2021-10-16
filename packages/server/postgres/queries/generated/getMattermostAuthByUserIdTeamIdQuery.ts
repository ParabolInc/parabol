/** Types generated for queries found in "packages/server/postgres/queries/src/getMattermostAuthByUserIdTeamIdQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetMattermostAuthByUserIdTeamIdQuery' parameters type */
export interface IGetMattermostAuthByUserIdTeamIdQueryParams {
  userId: string | null | void;
  teamId: string | null | void;
}

/** 'GetMattermostAuthByUserIdTeamIdQuery' return type */
export interface IGetMattermostAuthByUserIdTeamIdQueryResult {
  accessToken: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  userId: string;
  teamId: string;
}

/** 'GetMattermostAuthByUserIdTeamIdQuery' query type */
export interface IGetMattermostAuthByUserIdTeamIdQueryQuery {
  params: IGetMattermostAuthByUserIdTeamIdQueryParams;
  result: IGetMattermostAuthByUserIdTeamIdQueryResult;
}

const getMattermostAuthByUserIdTeamIdQueryIR: any = {"name":"getMattermostAuthByUserIdTeamIdQuery","params":[{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":100,"b":105,"line":5,"col":18}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":123,"b":128,"line":5,"col":41}]}}],"usedParamSet":{"userId":true,"teamId":true},"statement":{"body":"SELECT * from \"MattermostAuth\"\nWHERE \"userId\" = :userId AND \"teamId\" = :teamId AND \"isActive\" = TRUE","loc":{"a":51,"b":150,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * from "MattermostAuth"
 * WHERE "userId" = :userId AND "teamId" = :teamId AND "isActive" = TRUE
 * ```
 */
export const getMattermostAuthByUserIdTeamIdQuery = new PreparedQuery<IGetMattermostAuthByUserIdTeamIdQueryParams,IGetMattermostAuthByUserIdTeamIdQueryResult>(getMattermostAuthByUserIdTeamIdQueryIR);


