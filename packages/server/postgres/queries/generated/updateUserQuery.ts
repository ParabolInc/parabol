/** Types generated for queries found in "packages/server/postgres/queries/src/updateUserQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type TierEnum = 'personal' | 'pro' | 'enterprise';

/** 'UpdateUserQuery' parameters type */
export interface IUpdateUserQueryParams {
  email: string | null | void;
  updatedAt: Date | null | void;
  inactive: boolean | null | void;
  lastSeenAt: Date | null | void;
  preferredName: string | null | void;
  tier: TierEnum | null | void;
  picture: string | null | void;
  segmentId: string | null | void;
  id: string | null | void;
}

/** 'UpdateUserQuery' return type */
export type IUpdateUserQueryResult = void;

/** 'UpdateUserQuery' query type */
export interface IUpdateUserQueryQuery {
  params: IUpdateUserQueryParams;
  result: IUpdateUserQueryResult;
}

const updateUserQueryIR: any = {"name":"updateUserQuery","params":[{"name":"update","codeRefs":{"defined":{"a":36,"b":41,"line":3,"col":9},"used":[]},"transform":{"type":"pick_tuple","keys":["email","updatedAt","inactive","lastSeenAt","preferredName","tier","picture","segmentId"]}},{"name":"email","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":209,"b":213,"line":15,"col":20}]}},{"name":"updatedAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":250,"b":258,"line":16,"col":26}]}},{"name":"inactive","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":298,"b":305,"line":17,"col":23}]}},{"name":"lastSeenAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":346,"b":355,"line":18,"col":27}]}},{"name":"preferredName","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":403,"b":415,"line":19,"col":30}]}},{"name":"tier","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":455,"b":458,"line":20,"col":19}]}},{"name":"picture","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":490,"b":496,"line":21,"col":22}]}},{"name":"segmentId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":535,"b":543,"line":22,"col":26}]}},{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":571,"b":572,"line":23,"col":12}]}}],"usedParamSet":{"email":true,"updatedAt":true,"inactive":true,"lastSeenAt":true,"preferredName":true,"tier":true,"picture":true,"segmentId":true,"id":true},"statement":{"body":"UPDATE \"User\" SET\n  email = COALESCE(:email, email),\n  \"updatedAt\" = COALESCE(:updatedAt, \"updatedAt\"),\n  inactive = COALESCE(:inactive, inactive),\n  \"lastSeenAt\" = COALESCE(:lastSeenAt, \"lastSeenAt\"),\n  \"preferredName\" = COALESCE(:preferredName, \"preferredName\"),\n  tier = COALESCE(:tier, tier),\n  picture = COALESCE(:picture, picture),\n  \"segmentId\" = COALESCE(:segmentId, \"segmentId\")\nWHERE id = :id","loc":{"a":171,"b":572,"line":14,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "User" SET
 *   email = COALESCE(:email, email),
 *   "updatedAt" = COALESCE(:updatedAt, "updatedAt"),
 *   inactive = COALESCE(:inactive, inactive),
 *   "lastSeenAt" = COALESCE(:lastSeenAt, "lastSeenAt"),
 *   "preferredName" = COALESCE(:preferredName, "preferredName"),
 *   tier = COALESCE(:tier, tier),
 *   picture = COALESCE(:picture, picture),
 *   "segmentId" = COALESCE(:segmentId, "segmentId")
 * WHERE id = :id
 * ```
 */
export const updateUserQuery = new PreparedQuery<IUpdateUserQueryParams,IUpdateUserQueryResult>(updateUserQueryIR);


