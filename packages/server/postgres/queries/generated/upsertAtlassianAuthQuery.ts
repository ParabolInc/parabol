/** Types generated for queries found in "packages/server/postgres/queries/src/upsertAtlassianAuthQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type stringArray = (string)[];

/** 'UpsertAtlassianAuthQuery' parameters type */
export interface IUpsertAtlassianAuthQueryParams {
  auth: {
    accessToken: string | null | void,
    refreshToken: string | null | void,
    cloudIds: stringArray | null | void,
    scope: string | null | void,
    accountId: string | null | void,
    teamId: string | null | void,
    userId: string | null | void
  };
}

/** 'UpsertAtlassianAuthQuery' return type */
export type IUpsertAtlassianAuthQueryResult = void;

/** 'UpsertAtlassianAuthQuery' query type */
export interface IUpsertAtlassianAuthQueryQuery {
  params: IUpsertAtlassianAuthQueryParams;
  result: IUpsertAtlassianAuthQueryResult;
}

const upsertAtlassianAuthQueryIR: any = {"name":"upsertAtlassianAuthQuery","params":[{"name":"auth","codeRefs":{"defined":{"a":43,"b":46,"line":3,"col":8},"used":[{"a":281,"b":284,"line":14,"col":8}]},"transform":{"type":"pick_tuple","keys":["accessToken","refreshToken","cloudIds","scope","accountId","teamId","userId"]}}],"usedParamSet":{"auth":true},"statement":{"body":"INSERT INTO \"AtlassianAuth\" (\n    \"accessToken\",\n    \"refreshToken\",\n    \"cloudIds\",\n    \"scope\",\n    \"accountId\",\n    \"teamId\",\n    \"userId\"\n  )\nVALUES :auth ON CONFLICT (\"userId\", \"teamId\") DO\nUPDATE\nSET (\n    \"isActive\",\n    \"updatedAt\",\n    \"accessToken\",\n    \"refreshToken\",\n    \"cloudIds\",\n    \"scope\",\n    \"accountId\",\n    \"teamId\",\n    \"userId\"\n  ) = (\n    TRUE,\n    CURRENT_TIMESTAMP,\n    EXCLUDED.\"accessToken\",\n    EXCLUDED.\"refreshToken\",\n    EXCLUDED.\"cloudIds\",\n    EXCLUDED.\"scope\",\n    EXCLUDED.\"accountId\",\n    EXCLUDED.\"teamId\",\n    EXCLUDED.\"userId\"\n  )","loc":{"a":127,"b":698,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "AtlassianAuth" (
 *     "accessToken",
 *     "refreshToken",
 *     "cloudIds",
 *     "scope",
 *     "accountId",
 *     "teamId",
 *     "userId"
 *   )
 * VALUES :auth ON CONFLICT ("userId", "teamId") DO
 * UPDATE
 * SET (
 *     "isActive",
 *     "updatedAt",
 *     "accessToken",
 *     "refreshToken",
 *     "cloudIds",
 *     "scope",
 *     "accountId",
 *     "teamId",
 *     "userId"
 *   ) = (
 *     TRUE,
 *     CURRENT_TIMESTAMP,
 *     EXCLUDED."accessToken",
 *     EXCLUDED."refreshToken",
 *     EXCLUDED."cloudIds",
 *     EXCLUDED."scope",
 *     EXCLUDED."accountId",
 *     EXCLUDED."teamId",
 *     EXCLUDED."userId"
 *   )
 * ```
 */
export const upsertAtlassianAuthQuery = new PreparedQuery<IUpsertAtlassianAuthQueryParams,IUpsertAtlassianAuthQueryResult>(upsertAtlassianAuthQueryIR);


