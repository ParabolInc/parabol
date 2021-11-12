/** Types generated for queries found in "packages/server/postgres/queries/src/getMattermostAuthByTeamIdQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** Query 'GetMattermostAuthByTeamIdQuery' is invalid, so its result is assigned type 'never' */
export type IGetMattermostAuthByTeamIdQueryResult = never;

/** Query 'GetMattermostAuthByTeamIdQuery' is invalid, so its parameters are assigned type 'never' */
export type IGetMattermostAuthByTeamIdQueryParams = never;

const getMattermostAuthByTeamIdQueryIR: any = {"name":"getMattermostAuthByTeamIdQuery","params":[{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":94,"b":99,"line":5,"col":18}]}}],"usedParamSet":{"teamId":true},"statement":{"body":"SELECT * from \"MattermostAuth\"\nWHERE \"teamId\" = :teamId AND \"isActive\" = TRUE","loc":{"a":45,"b":121,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * from "MattermostAuth"
 * WHERE "teamId" = :teamId AND "isActive" = TRUE
 * ```
 */
export const getMattermostAuthByTeamIdQuery = new PreparedQuery<IGetMattermostAuthByTeamIdQueryParams,IGetMattermostAuthByTeamIdQueryResult>(getMattermostAuthByTeamIdQueryIR);


