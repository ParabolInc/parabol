/** Types generated for queries found in "packages/server/postgres/queries/src/archiveTeamsByTeamIdsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type MeetingTypeEnum = 'action' | 'poker' | 'retrospective';

export type TierEnum = 'enterprise' | 'personal' | 'pro';

export type JsonArray = (null | boolean | number | string | Json[] | { [key: string]: Json })[];

/** 'ArchiveTeamsByTeamIdsQuery' parameters type */
export interface IArchiveTeamsByTeamIdsQueryParams {
  ids: readonly (string | null | void)[];
}

/** 'ArchiveTeamsByTeamIdsQuery' return type */
export interface IArchiveTeamsByTeamIdsQueryResult {
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

/** 'ArchiveTeamsByTeamIdsQuery' query type */
export interface IArchiveTeamsByTeamIdsQueryQuery {
  params: IArchiveTeamsByTeamIdsQueryParams;
  result: IArchiveTeamsByTeamIdsQueryResult;
}

const archiveTeamsByTeamIdsQueryIR: any = {"name":"archiveTeamsByTeamIdsQuery","params":[{"name":"ids","codeRefs":{"defined":{"a":47,"b":49,"line":3,"col":9},"used":[{"a":118,"b":120,"line":8,"col":9}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"ids":true},"statement":{"body":"UPDATE \"Team\" SET\n  \"isArchived\" = true\nWHERE\n  id IN :ids AND\n  \"isArchived\" = false\nRETURNING *","loc":{"a":63,"b":159,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "Team" SET
 *   "isArchived" = true
 * WHERE
 *   id IN :ids AND
 *   "isArchived" = false
 * RETURNING *
 * ```
 */
export const archiveTeamsByTeamIdsQuery = new PreparedQuery<IArchiveTeamsByTeamIdsQueryParams,IArchiveTeamsByTeamIdsQueryResult>(archiveTeamsByTeamIdsQueryIR);


