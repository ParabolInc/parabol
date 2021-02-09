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
  isRemoved: boolean | null | void;
  reasonRemoved: string | null | void;
  id: string | null | void;
}

/** 'UpdateUserQuery' return type */
export type IUpdateUserQueryResult = void;

/** 'UpdateUserQuery' query type */
export interface IUpdateUserQueryQuery {
  params: IUpdateUserQueryParams;
  result: IUpdateUserQueryResult;
}

const updateUserQueryIR: any = {"name":"updateUserQuery","params":[{"name":"update","codeRefs":{"defined":{"a":36,"b":41,"line":3,"col":9},"used":[]},"transform":{"type":"pick_tuple","keys":["email","updatedAt","inactive","lastSeenAt","preferredName","tier","picture","segmentId","isRemoved","reasonRemoved"]}},{"name":"email","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":239,"b":243,"line":17,"col":20}]}},{"name":"updatedAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":280,"b":288,"line":18,"col":26}]}},{"name":"inactive","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":328,"b":335,"line":19,"col":23}]}},{"name":"lastSeenAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":376,"b":385,"line":20,"col":27}]}},{"name":"preferredName","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":433,"b":445,"line":21,"col":30}]}},{"name":"tier","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":485,"b":488,"line":22,"col":19}]}},{"name":"picture","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":520,"b":526,"line":23,"col":22}]}},{"name":"segmentId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":565,"b":573,"line":24,"col":26}]}},{"name":"isRemoved","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":616,"b":624,"line":25,"col":26}]}},{"name":"reasonRemoved","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":671,"b":683,"line":26,"col":30}]}},{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":715,"b":716,"line":27,"col":12}]}}],"usedParamSet":{"email":true,"updatedAt":true,"inactive":true,"lastSeenAt":true,"preferredName":true,"tier":true,"picture":true,"segmentId":true,"isRemoved":true,"reasonRemoved":true,"id":true},"statement":{"body":"UPDATE \"User\" SET\n  email = COALESCE(:email, email),\n  \"updatedAt\" = COALESCE(:updatedAt, \"updatedAt\"),\n  inactive = COALESCE(:inactive, inactive),\n  \"lastSeenAt\" = COALESCE(:lastSeenAt, \"lastSeenAt\"),\n  \"preferredName\" = COALESCE(:preferredName, \"preferredName\"),\n  tier = COALESCE(:tier, tier),\n  picture = COALESCE(:picture, picture),\n  \"segmentId\" = COALESCE(:segmentId, \"segmentId\"),\n  \"isRemoved\" = COALESCE(:isRemoved, \"isRemoved\"),\n  \"reasonRemoved\" = COALESCE(:reasonRemoved, \"reasonRemoved\")\nWHERE id = :id","loc":{"a":201,"b":716,"line":16,"col":0}}};

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
 *   "segmentId" = COALESCE(:segmentId, "segmentId"),
 *   "isRemoved" = COALESCE(:isRemoved, "isRemoved"),
 *   "reasonRemoved" = COALESCE(:reasonRemoved, "reasonRemoved")
 * WHERE id = :id
 * ```
 */
export const updateUserQuery = new PreparedQuery<IUpdateUserQueryParams,IUpdateUserQueryResult>(updateUserQueryIR);


