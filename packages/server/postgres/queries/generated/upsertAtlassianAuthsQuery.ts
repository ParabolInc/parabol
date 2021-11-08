/** Types generated for queries found in "packages/server/postgres/queries/src/upsertAtlassianAuthsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type stringArray = (string)[];

/** 'UpsertAtlassianAuthsQuery' parameters type */
export interface IUpsertAtlassianAuthsQueryParams {
  auths: readonly ({
    accessToken: string | null | void,
    refreshToken: string | null | void,
    cloudIds: stringArray | null | void,
    scope: string | null | void,
    accountId: string | null | void,
    teamId: string | null | void,
    userId: string | null | void
  })[];
}

/** 'UpsertAtlassianAuthsQuery' return type */
export type IUpsertAtlassianAuthsQueryResult = void;

/** 'UpsertAtlassianAuthsQuery' query type */
export interface IUpsertAtlassianAuthsQueryQuery {
  params: IUpsertAtlassianAuthsQueryParams;
  result: IUpsertAtlassianAuthsQueryResult;
}

const upsertAtlassianAuthsQueryIR: any = {"name":"upsertAtlassianAuthsQuery","params":[{"name":"auths","codeRefs":{"defined":{"a":44,"b":48,"line":3,"col":8},"used":[{"a":288,"b":292,"line":14,"col":8}]},"transform":{"type":"pick_array_spread","keys":["accessToken","refreshToken","cloudIds","scope","accountId","teamId","userId"]}}],"usedParamSet":{"auths":true},"statement":{"body":"INSERT INTO \"AtlassianAuth\" (\n    \"accessToken\",\n    \"refreshToken\",\n    \"cloudIds\",\n    \"scope\",\n    \"accountId\",\n    \"teamId\",\n    \"userId\"\n  )\nVALUES :auths ON CONFLICT (\"userId\", \"teamId\") DO\nUPDATE\nSET (\n    \"isActive\",\n    \"updatedAt\",\n    \"accessToken\",\n    \"refreshToken\",\n    \"cloudIds\",\n    \"scope\",\n    \"accountId\",\n    \"teamId\",\n    \"userId\"\n  ) = (\n    EXCLUDED.\"isActive\",\n    EXCLUDED.\"updatedAt\",\n    EXCLUDED.\"accessToken\",\n    EXCLUDED.\"refreshToken\",\n    EXCLUDED.\"cloudIds\",\n    EXCLUDED.\"scope\",\n    EXCLUDED.\"accountId\",\n    EXCLUDED.\"teamId\",\n    EXCLUDED.\"userId\"\n  )","loc":{"a":134,"b":724,"line":5,"col":0}}};

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
 * VALUES :auths ON CONFLICT ("userId", "teamId") DO
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
 *     EXCLUDED."isActive",
 *     EXCLUDED."updatedAt",
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
export const upsertAtlassianAuthsQuery = new PreparedQuery<IUpsertAtlassianAuthsQueryParams,IUpsertAtlassianAuthsQueryResult>(upsertAtlassianAuthsQueryIR);


