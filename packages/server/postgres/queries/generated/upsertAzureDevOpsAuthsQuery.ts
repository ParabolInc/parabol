/** Types generated for queries found in "packages/server/postgres/queries/src/upsertAzureDevOpsAuthsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type stringArray = (string)[];

/** 'UpsertAzureDevOpsAuthsQuery' parameters type */
export interface IUpsertAzureDevOpsAuthsQueryParams {
  auths: readonly ({
    accessToken: string | null | void,
    refreshToken: string | null | void,
    instanceIds: stringArray | null | void,
    scope: string | null | void,
    accountId: string | null | void,
    teamId: string | null | void,
    userId: string | null | void
  })[];
}

/** 'UpsertAzureDevOpsAuthsQuery' return type */
export type IUpsertAzureDevOpsAuthsQueryResult = void;

/** 'UpsertAzureDevOpsAuthsQuery' query type */
export interface IUpsertAzureDevOpsAuthsQueryQuery {
  params: IUpsertAzureDevOpsAuthsQueryParams;
  result: IUpsertAzureDevOpsAuthsQueryResult;
}

const upsertAzureDevOpsAuthsQueryIR: any = {"name":"upsertAzureDevOpsAuthsQuery","params":[{"name":"auths","codeRefs":{"defined":{"a":46,"b":50,"line":3,"col":8},"used":[{"a":298,"b":302,"line":14,"col":8}]},"transform":{"type":"pick_array_spread","keys":["accessToken","refreshToken","instanceIds","scope","accountId","teamId","userId"]}}],"usedParamSet":{"auths":true},"statement":{"body":"INSERT INTO \"AzureDevOpsAuth\" (\n    \"accessToken\",\n    \"refreshToken\",\n    \"instanceIds\",\n    \"scope\",\n    \"accountId\",\n    \"teamId\",\n    \"userId\"\n  )\nVALUES :auths ON CONFLICT (\"userId\", \"teamId\") DO\nUPDATE\nSET (\n    \"isActive\",\n    \"updatedAt\",\n    \"accessToken\",\n    \"refreshToken\",\n    \"instanceIds\",\n    \"scope\",\n    \"accountId\",\n    \"teamId\",\n    \"userId\"\n  ) = (\n    TRUE,\n    CURRENT_TIMESTAMP,\n    EXCLUDED.\"accessToken\",\n    EXCLUDED.\"refreshToken\",\n    EXCLUDED.\"instanceIds\",\n    EXCLUDED.\"scope\",\n    EXCLUDED.\"accountId\",\n    EXCLUDED.\"teamId\",\n    EXCLUDED.\"userId\"\n  )","loc":{"a":139,"b":722,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "AzureDevOpsAuth" (
 *     "accessToken",
 *     "refreshToken",
 *     "instanceIds",
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
 *     "instanceIds",
 *     "scope",
 *     "accountId",
 *     "teamId",
 *     "userId"
 *   ) = (
 *     TRUE,
 *     CURRENT_TIMESTAMP,
 *     EXCLUDED."accessToken",
 *     EXCLUDED."refreshToken",
 *     EXCLUDED."instanceIds",
 *     EXCLUDED."scope",
 *     EXCLUDED."accountId",
 *     EXCLUDED."teamId",
 *     EXCLUDED."userId"
 *   )
 * ```
 */
export const upsertAzureDevOpsAuthsQuery = new PreparedQuery<IUpsertAzureDevOpsAuthsQueryParams,IUpsertAzureDevOpsAuthsQueryResult>(upsertAzureDevOpsAuthsQueryIR);


