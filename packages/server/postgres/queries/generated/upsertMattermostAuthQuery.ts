/** Types generated for queries found in "packages/server/postgres/queries/src/upsertMattermostAuthQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'UpsertMattermostAuthQuery' parameters type */
export interface IUpsertMattermostAuthQueryParams {
  auth: {
    webhookUrl: string | null | void,
    userId: string | null | void,
    teamId: string | null | void
  };
}

/** 'UpsertMattermostAuthQuery' return type */
export type IUpsertMattermostAuthQueryResult = void;

/** 'UpsertMattermostAuthQuery' query type */
export interface IUpsertMattermostAuthQueryQuery {
  params: IUpsertMattermostAuthQueryParams;
  result: IUpsertMattermostAuthQueryResult;
}

const upsertMattermostAuthQueryIR: any = {"name":"upsertMattermostAuthQuery","params":[{"name":"auth","codeRefs":{"defined":{"a":44,"b":47,"line":3,"col":8},"used":[{"a":173,"b":176,"line":10,"col":8}]},"transform":{"type":"pick_tuple","keys":["webhookUrl","userId","teamId"]}}],"usedParamSet":{"auth":true},"statement":{"body":"INSERT INTO \"MattermostAuth\" (\n    \"webhookUrl\",\n    \"userId\",\n    \"teamId\"\n  )\nVALUES :auth ON CONFLICT (\"userId\", \"teamId\") DO\nUPDATE\nSET (\n    \"isActive\",\n    \"updatedAt\",\n    \"webhookUrl\",\n    \"teamId\",\n    \"userId\"\n  ) = (\n    TRUE,\n    CURRENT_TIMESTAMP,\n    EXCLUDED.\"webhookUrl\",\n    EXCLUDED.\"teamId\",\n    EXCLUDED.\"userId\"\n  )","loc":{"a":85,"b":420,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "MattermostAuth" (
 *     "webhookUrl",
 *     "userId",
 *     "teamId"
 *   )
 * VALUES :auth ON CONFLICT ("userId", "teamId") DO
 * UPDATE
 * SET (
 *     "isActive",
 *     "updatedAt",
 *     "webhookUrl",
 *     "teamId",
 *     "userId"
 *   ) = (
 *     TRUE,
 *     CURRENT_TIMESTAMP,
 *     EXCLUDED."webhookUrl",
 *     EXCLUDED."teamId",
 *     EXCLUDED."userId"
 *   )
 * ```
 */
export const upsertMattermostAuthQuery = new PreparedQuery<IUpsertMattermostAuthQueryParams,IUpsertMattermostAuthQueryResult>(upsertMattermostAuthQueryIR);


