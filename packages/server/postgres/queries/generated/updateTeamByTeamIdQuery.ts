/** Types generated for queries found in "packages/server/postgres/queries/src/updateTeamByTeamIdQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type MeetingTypeEnum = 'action' | 'retrospective' | 'poker';

export type TierEnum = 'personal' | 'pro' | 'enterprise';

export type JsonArray = (null | boolean | number | string | Json[] | { [key: string]: Json })[];

/** 'UpdateTeamByTeamIdQuery' parameters type */
export interface IUpdateTeamByTeamIdQueryParams {
  ids: Array<string | null | void>;
  name: string | null | void;
  isArchived: boolean | null | void;
  isPaid: boolean | null | void;
  jiraDimensionFields: JsonArray | null | void;
  lastMeetingType: MeetingTypeEnum | null | void;
  tier: TierEnum | null | void;
  orgId: string | null | void;
  updatedAt: Date | null | void;
  eqChecked: Date | null | void;
}

/** 'UpdateTeamByTeamIdQuery' return type */
export interface IUpdateTeamByTeamIdQueryResult {
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
  eqChecked: Date;
}

/** 'UpdateTeamByTeamIdQuery' query type */
export interface IUpdateTeamByTeamIdQueryQuery {
  params: IUpdateTeamByTeamIdQueryParams;
  result: IUpdateTeamByTeamIdQueryResult;
}

const updateTeamByTeamIdQueryIR: any = {"name":"updateTeamByTeamIdQuery","params":[{"name":"ids","codeRefs":{"defined":{"a":44,"b":46,"line":3,"col":9},"used":[{"a":549,"b":551,"line":15,"col":13}]},"transform":{"type":"array_spread"}},{"name":"name","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":99,"b":102,"line":6,"col":21}]}},{"name":"isArchived","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":141,"b":150,"line":7,"col":27}]}},{"name":"isPaid","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":191,"b":196,"line":8,"col":23}]}},{"name":"jiraDimensionFields","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":246,"b":264,"line":9,"col":36}]}},{"name":"lastMeetingType","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":323,"b":337,"line":10,"col":32}]}},{"name":"tier","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":381,"b":384,"line":11,"col":21}]}},{"name":"orgId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":418,"b":422,"line":12,"col":22}]}},{"name":"updatedAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":461,"b":469,"line":13,"col":26}]}},{"name":"eqChecked","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":512,"b":520,"line":14,"col":26}]}}],"usedParamSet":{"name":true,"isArchived":true,"isPaid":true,"jiraDimensionFields":true,"lastMeetingType":true,"tier":true,"orgId":true,"updatedAt":true,"eqChecked":true,"ids":true},"statement":{"body":"UPDATE \"Team\" SET\n  \"name\" = COALESCE(:name, \"name\"),\n  \"isArchived\" = COALESCE(:isArchived, \"isArchived\"),\n  \"isPaid\" = COALESCE(:isPaid, \"isPaid\"),\n  \"jiraDimensionFields\" = COALESCE(:jiraDimensionFields, \"jiraDimensionFields\"),\n  \"lastMeetingType\" = COALESCE(:lastMeetingType, \"lastMeetingType\"),\n  \"tier\" = COALESCE(:tier, \"tier\"),\n  \"orgId\" = COALESCE(:orgId, \"orgId\"),\n  \"updatedAt\" = COALESCE(:updatedAt, \"updatedAt\"),\n  \"eqChecked\" = COALESCE(:eqChecked, \"eqChecked\")\nWHERE id IN :ids\nRETURNING *","loc":{"a":60,"b":563,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "Team" SET
 *   "name" = COALESCE(:name, "name"),
 *   "isArchived" = COALESCE(:isArchived, "isArchived"),
 *   "isPaid" = COALESCE(:isPaid, "isPaid"),
 *   "jiraDimensionFields" = COALESCE(:jiraDimensionFields, "jiraDimensionFields"),
 *   "lastMeetingType" = COALESCE(:lastMeetingType, "lastMeetingType"),
 *   "tier" = COALESCE(:tier, "tier"),
 *   "orgId" = COALESCE(:orgId, "orgId"),
 *   "updatedAt" = COALESCE(:updatedAt, "updatedAt"),
 *   "eqChecked" = COALESCE(:eqChecked, "eqChecked")
 * WHERE id IN :ids
 * RETURNING *
 * ```
 */
export const updateTeamByTeamIdQuery = new PreparedQuery<IUpdateTeamByTeamIdQueryParams,IUpdateTeamByTeamIdQueryResult>(updateTeamByTeamIdQueryIR);


