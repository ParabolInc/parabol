/** Types generated for queries found in "packages/server/postgres/queries/src/upsertIntegrationTokenQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderServiceEnum = 'gitlab' | 'mattermost';

/** 'UpsertIntegrationTokenQuery' parameters type */
export interface IUpsertIntegrationTokenQueryParams {
  auth: {
    providerId: number | null | void,
    teamId: string | null | void,
    userId: string | null | void,
    service: IntegrationProviderServiceEnum | null | void,
    accessToken: string | null | void,
    refreshToken: string | null | void,
    scopes: string | null | void
  };
}

/** 'UpsertIntegrationTokenQuery' return type */
export type IUpsertIntegrationTokenQueryResult = void;

/** 'UpsertIntegrationTokenQuery' query type */
export interface IUpsertIntegrationTokenQueryQuery {
  params: IUpsertIntegrationTokenQueryParams;
  result: IUpsertIntegrationTokenQueryResult;
}

const upsertIntegrationTokenQueryIR: any = {"name":"upsertIntegrationTokenQuery","params":[{"name":"auth","codeRefs":{"defined":{"a":46,"b":49,"line":3,"col":8},"used":[{"a":293,"b":296,"line":16,"col":3}]},"transform":{"type":"pick_tuple","keys":["providerId","teamId","userId","service","accessToken","refreshToken","scopes"]}}],"usedParamSet":{"auth":true},"statement":{"body":"INSERT INTO\n  \"IntegrationToken\" (\n    \"providerId\",\n    \"teamId\",\n    \"userId\",\n    \"service\",\n    \"accessToken\",\n    \"refreshToken\",\n    \"scopes\"\n  )\nVALUES\n  :auth ON CONFLICT (\"userId\", \"teamId\", \"service\") DO\nUPDATE\nSET\n  (\n    \"providerId\",\n    \"accessToken\",\n    \"refreshToken\",\n    \"scopes\",\n    \"isActive\",\n    \"updatedAt\"\n  ) = (\n    EXCLUDED.\"providerId\",\n    EXCLUDED.\"accessToken\",\n    EXCLUDED.\"refreshToken\",\n    EXCLUDED.\"scopes\",\n    TRUE,\n    CURRENT_TIMESTAMP\n  )","loc":{"a":131,"b":612,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO
 *   "IntegrationToken" (
 *     "providerId",
 *     "teamId",
 *     "userId",
 *     "service",
 *     "accessToken",
 *     "refreshToken",
 *     "scopes"
 *   )
 * VALUES
 *   :auth ON CONFLICT ("userId", "teamId", "service") DO
 * UPDATE
 * SET
 *   (
 *     "providerId",
 *     "accessToken",
 *     "refreshToken",
 *     "scopes",
 *     "isActive",
 *     "updatedAt"
 *   ) = (
 *     EXCLUDED."providerId",
 *     EXCLUDED."accessToken",
 *     EXCLUDED."refreshToken",
 *     EXCLUDED."scopes",
 *     TRUE,
 *     CURRENT_TIMESTAMP
 *   )
 * ```
 */
export const upsertIntegrationTokenQuery = new PreparedQuery<IUpsertIntegrationTokenQueryParams,IUpsertIntegrationTokenQueryResult>(upsertIntegrationTokenQueryIR);


