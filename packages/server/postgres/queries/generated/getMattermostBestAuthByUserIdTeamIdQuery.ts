/** Types generated for queries found in "packages/server/postgres/queries/src/getMattermostBestAuthByUserIdTeamIdQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** Query 'GetMattermostBestAuthByUserIdTeamIdQuery' is invalid, so its result is assigned type 'never' */
export type IGetMattermostBestAuthByUserIdTeamIdQueryResult = never;

/** Query 'GetMattermostBestAuthByUserIdTeamIdQuery' is invalid, so its parameters are assigned type 'never' */
export type IGetMattermostBestAuthByUserIdTeamIdQueryParams = never;

const getMattermostBestAuthByUserIdTeamIdQueryIR: any = {"name":"getMattermostBestAuthByUserIdTeamIdQuery","params":[{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":75,"b":80,"line":4,"col":20}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":155,"b":160,"line":6,"col":20}]}}],"usedParamSet":{"userId":true,"teamId":true},"statement":{"body":"SELECT (\"userId\" = :userId)::int AS \"userEquality\", *  \n  FROM \"MattermostAuth\"\n  WHERE \"teamId\" = :teamId AND \"isActive\" = TRUE\n  ORDER BY \"userEquality\" DESC, \"updatedAt\" DESC\n  LIMIT 1","loc":{"a":55,"b":241,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT ("userId" = :userId)::int AS "userEquality", *  
 *   FROM "MattermostAuth"
 *   WHERE "teamId" = :teamId AND "isActive" = TRUE
 *   ORDER BY "userEquality" DESC, "updatedAt" DESC
 *   LIMIT 1
 * ```
 */
export const getMattermostBestAuthByUserIdTeamIdQuery = new PreparedQuery<IGetMattermostBestAuthByUserIdTeamIdQueryParams,IGetMattermostBestAuthByUserIdTeamIdQueryResult>(getMattermostBestAuthByUserIdTeamIdQueryIR);


