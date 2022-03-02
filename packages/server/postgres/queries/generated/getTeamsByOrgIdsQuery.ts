/** Types generated for queries found in "packages/server/postgres/queries/src/getTeamsByOrgIdsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type MeetingTypeEnum = 'action' | 'poker' | 'retrospective' | 'teamPrompt';

export type TierEnum = 'enterprise' | 'personal' | 'pro';

export type JsonArray = (null | boolean | number | string | Json[] | { [key: string]: Json })[];

/** 'GetTeamsByOrgIdsQuery' parameters type */
export interface IGetTeamsByOrgIdsQueryParams {
  orgIds: readonly (string | null | void)[];
  isArchived: boolean | null | void;
}

/** 'GetTeamsByOrgIdsQuery' return type */
export interface IGetTeamsByOrgIdsQueryResult {
  id: string;
  name: string;
  createdAt: Date;
  createdBy: string | null;
  isArchived: boolean;
  isPaid: boolean;
  jiraDimensionFields: JsonArray;
  lastMeetingType: MeetingTypeEnum;
  tier: TierEnum;
  orgId: string;
  isOnboardTeam: boolean;
  updatedAt: Date;
  lockMessageHTML: string | null;
}

/** 'GetTeamsByOrgIdsQuery' query type */
export interface IGetTeamsByOrgIdsQueryQuery {
  params: IGetTeamsByOrgIdsQueryParams;
  result: IGetTeamsByOrgIdsQueryResult;
}

const getTeamsByOrgIdsQueryIR: any = {"name":"getTeamsByOrgIdsQuery","params":[{"name":"orgIds","codeRefs":{"defined":{"a":42,"b":47,"line":3,"col":9},"used":[{"a":100,"b":105,"line":6,"col":18}]},"transform":{"type":"array_spread"}},{"name":"isArchived","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":127,"b":136,"line":7,"col":20}]}}],"usedParamSet":{"orgIds":true,"isArchived":true},"statement":{"body":"SELECT * FROM \"Team\"\nWHERE \"orgId\" IN :orgIds\nAND \"isArchived\" = :isArchived","loc":{"a":61,"b":136,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "Team"
 * WHERE "orgId" IN :orgIds
 * AND "isArchived" = :isArchived
 * ```
 */
export const getTeamsByOrgIdsQuery = new PreparedQuery<IGetTeamsByOrgIdsQueryParams,IGetTeamsByOrgIdsQueryResult>(getTeamsByOrgIdsQueryIR);


