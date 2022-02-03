/** Types generated for queries found in "packages/server/postgres/queries/src/removeTeamMemberIntegrationAuthQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type IntegrationProviderServiceEnum = 'gitlab' | 'jiraServer' | 'mattermost';

/** 'RemoveTeamMemberIntegrationAuthQuery' parameters type */
export interface IRemoveTeamMemberIntegrationAuthQueryParams {
  userId: string | null | void;
  teamId: string | null | void;
  service: IntegrationProviderServiceEnum | null | void;
}

/** 'RemoveTeamMemberIntegrationAuthQuery' return type */
export type IRemoveTeamMemberIntegrationAuthQueryResult = void;

/** 'RemoveTeamMemberIntegrationAuthQuery' query type */
export interface IRemoveTeamMemberIntegrationAuthQueryQuery {
  params: IRemoveTeamMemberIntegrationAuthQueryParams;
  result: IRemoveTeamMemberIntegrationAuthQueryResult;
}

const removeTeamMemberIntegrationAuthQueryIR: any = {"name":"removeTeamMemberIntegrationAuthQuery","params":[{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":160,"b":165,"line":6,"col":18}]}},{"name":"teamId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":185,"b":190,"line":7,"col":18}]}},{"name":"service","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":211,"b":217,"line":8,"col":19}]}}],"usedParamSet":{"userId":true,"teamId":true,"service":true},"statement":{"body":"UPDATE \"TeamMemberIntegrationAuth\"\nSET \"isActive\" = FALSE, \"updatedAt\" = CURRENT_TIMESTAMP\nWHERE \"userId\" = :userId\n  AND \"teamId\" = :teamId\n  AND \"service\" = :service\n  AND \"isActive\" = TRUE","loc":{"a":51,"b":241,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "TeamMemberIntegrationAuth"
 * SET "isActive" = FALSE, "updatedAt" = CURRENT_TIMESTAMP
 * WHERE "userId" = :userId
 *   AND "teamId" = :teamId
 *   AND "service" = :service
 *   AND "isActive" = TRUE
 * ```
 */
export const removeTeamMemberIntegrationAuthQuery = new PreparedQuery<IRemoveTeamMemberIntegrationAuthQueryParams,IRemoveTeamMemberIntegrationAuthQueryResult>(removeTeamMemberIntegrationAuthQueryIR);


