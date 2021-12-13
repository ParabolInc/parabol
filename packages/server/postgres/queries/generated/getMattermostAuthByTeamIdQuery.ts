/** Types generated for queries found in "packages/server/postgres/queries/src/getMattermostAuthByTeamIdQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetMattermostAuthByTeamIdQuery' parameters type */
export interface IGetMattermostAuthByTeamIdQueryParams {
  teamId: string | null | void;
}

/** 'GetMattermostAuthByTeamIdQuery' return type */
export interface IGetMattermostAuthByTeamIdQueryResult {
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  webhookUrl: string;
  userId: string;
  teamId: string;
}

/** 'GetMattermostAuthByTeamIdQuery' query type */
export interface IGetMattermostAuthByTeamIdQueryQuery {
  params: IGetMattermostAuthByTeamIdQueryParams;
  result: IGetMattermostAuthByTeamIdQueryResult;
}

const getMattermostAuthByTeamIdQueryIR: any = {"name":"getMattermostAuthByTeamIdQuery","params":[{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":94,"b":99,"line":5,"col":18}]}}],"usedParamSet":{"teamId":true},"statement":{"body":"SELECT * from \"MattermostAuth\"\nWHERE \"teamId\" = :teamId AND \"isActive\" = TRUE","loc":{"a":45,"b":121,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * from "MattermostAuth"
 * WHERE "teamId" = :teamId AND "isActive" = TRUE
 * ```
 */
export const getMattermostAuthByTeamIdQuery = new PreparedQuery<IGetMattermostAuthByTeamIdQueryParams,IGetMattermostAuthByTeamIdQueryResult>(getMattermostAuthByTeamIdQueryIR);


