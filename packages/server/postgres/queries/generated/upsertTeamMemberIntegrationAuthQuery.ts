/** Types generated for queries found in "packages/server/postgres/queries/src/upsertTeamMemberIntegrationAuthQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderServiceEnum = 'azureDevOps' | 'gitlab' | 'jiraServer' | 'mattermost' | 'msTeams';

/** 'UpsertTeamMemberIntegrationAuthQuery' parameters type */
export interface IUpsertTeamMemberIntegrationAuthQueryParams {
  auth: {
    providerId: number | null | void,
    teamId: string | null | void,
    userId: string | null | void,
    service: IntegrationProviderServiceEnum | null | void,
    accessToken: string | null | void,
    refreshToken: string | null | void,
    scopes: string | null | void,
    accessTokenSecret: string | null | void
  };
}

/** 'UpsertTeamMemberIntegrationAuthQuery' return type */
export type IUpsertTeamMemberIntegrationAuthQueryResult = void;

/** 'UpsertTeamMemberIntegrationAuthQuery' query type */
export interface IUpsertTeamMemberIntegrationAuthQueryQuery {
  params: IUpsertTeamMemberIntegrationAuthQueryParams;
  result: IUpsertTeamMemberIntegrationAuthQueryResult;
}

const upsertTeamMemberIntegrationAuthQueryIR: any = {"name":"upsertTeamMemberIntegrationAuthQuery","params":[{"name":"auth","codeRefs":{"defined":{"a":55,"b":58,"line":3,"col":8},"used":[{"a":355,"b":358,"line":17,"col":3}]},"transform":{"type":"pick_tuple","keys":["providerId","teamId","userId","service","accessToken","refreshToken","scopes","accessTokenSecret"]}}],"usedParamSet":{"auth":true},"statement":{"body":"INSERT INTO\n  \"TeamMemberIntegrationAuth\" (\n    \"providerId\",\n    \"teamId\",\n    \"userId\",\n    \"service\",\n    \"accessToken\",\n    \"refreshToken\",\n    \"scopes\",\n    \"accessTokenSecret\"\n  )\nVALUES\n  :auth ON CONFLICT (\"userId\", \"teamId\", \"service\") DO\nUPDATE\nSET\n  (\n    \"providerId\",\n    \"accessToken\",\n    \"refreshToken\",\n    \"scopes\",\n    \"accessTokenSecret\",\n    \"isActive\",\n    \"updatedAt\"\n  ) = (\n    EXCLUDED.\"providerId\",\n    EXCLUDED.\"accessToken\",\n    EXCLUDED.\"refreshToken\",\n    EXCLUDED.\"scopes\",\n    EXCLUDED.\"accessTokenSecret\",\n    TRUE,\n    CURRENT_TIMESTAMP\n  )","loc":{"a":159,"b":733,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO
 *   "TeamMemberIntegrationAuth" (
 *     "providerId",
 *     "teamId",
 *     "userId",
 *     "service",
 *     "accessToken",
 *     "refreshToken",
 *     "scopes",
 *     "accessTokenSecret"
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
 *     "accessTokenSecret",
 *     "isActive",
 *     "updatedAt"
 *   ) = (
 *     EXCLUDED."providerId",
 *     EXCLUDED."accessToken",
 *     EXCLUDED."refreshToken",
 *     EXCLUDED."scopes",
 *     EXCLUDED."accessTokenSecret",
 *     TRUE,
 *     CURRENT_TIMESTAMP
 *   )
 * ```
 */
export const upsertTeamMemberIntegrationAuthQuery = new PreparedQuery<IUpsertTeamMemberIntegrationAuthQueryParams,IUpsertTeamMemberIntegrationAuthQueryResult>(upsertTeamMemberIntegrationAuthQueryIR);


