/** Types generated for queries found in "packages/server/postgres/queries/src/updateUserQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type TierEnum = 'personal' | 'pro' | 'enterprise';

/** 'UpdateUserQuery' parameters type */
export interface IUpdateUserQueryParams {
  email: boolean | null | void;
  emailValue: string | null | void;
  updatedAt: boolean | null | void;
  updatedAtValue: Date | null | void;
  inactive: boolean | null | void;
  inactiveValue: boolean | null | void;
  lastSeenAt: boolean | null | void;
  lastSeenAtValue: Date | null | void;
  preferredName: boolean | null | void;
  preferredNameValue: string | null | void;
  tier: boolean | null | void;
  tierValue: TierEnum | null | void;
  picture: boolean | null | void;
  pictureValue: string | null | void;
  segmentId: boolean | null | void;
  segmentIdValue: string | null | void;
  isRemoved: boolean | null | void;
  isRemovedValue: boolean | null | void;
  reasonRemoved: boolean | null | void;
  reasonRemovedValue: string | null | void;
  newFeatureId: boolean | null | void;
  newFeatureIdValue: string | null | void;
  id: string | null | void;
}

/** 'UpdateUserQuery' return type */
export type IUpdateUserQueryResult = void;

/** 'UpdateUserQuery' query type */
export interface IUpdateUserQueryQuery {
  params: IUpdateUserQueryParams;
  result: IUpdateUserQueryResult;
}

const updateUserQueryIR: any = {"name":"updateUserQuery","params":[{"name":"update","codeRefs":{"defined":{"a":36,"b":41,"line":3,"col":9},"used":[]},"transform":{"type":"pick_tuple","keys":["email","emailValue","updatedAt","updatedAtValue","inactive","inactiveValue","lastSeenAt","lastSeenAtValue","preferredName","preferredNameValue","tier","tierValue","picture","pictureValue","segmentId","segmentIdValue","isRemoved","isRemovedValue","reasonRemoved","reasonRemovedValue","newFeatureId"]}},{"name":"email","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":455,"b":459,"line":28,"col":21}]}},{"name":"emailValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":467,"b":476,"line":28,"col":33}]}},{"name":"updatedAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":521,"b":529,"line":29,"col":27}]}},{"name":"updatedAtValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":537,"b":550,"line":29,"col":43}]}},{"name":"inactive","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":598,"b":605,"line":30,"col":24}]}},{"name":"inactiveValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":613,"b":625,"line":30,"col":39}]}},{"name":"lastSeenAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":674,"b":683,"line":31,"col":28}]}},{"name":"lastSeenAtValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":691,"b":705,"line":31,"col":45}]}},{"name":"preferredName","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":761,"b":773,"line":32,"col":31}]}},{"name":"preferredNameValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":781,"b":798,"line":32,"col":51}]}},{"name":"tier","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":846,"b":849,"line":33,"col":20}]}},{"name":"tierValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":857,"b":865,"line":33,"col":31}]}},{"name":"picture","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":905,"b":911,"line":34,"col":23}]}},{"name":"pictureValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":919,"b":930,"line":34,"col":37}]}},{"name":"segmentId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":977,"b":985,"line":35,"col":27}]}},{"name":"segmentIdValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":993,"b":1006,"line":35,"col":43}]}},{"name":"isRemoved","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1057,"b":1065,"line":36,"col":27}]}},{"name":"isRemovedValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1073,"b":1086,"line":36,"col":43}]}},{"name":"reasonRemoved","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1141,"b":1153,"line":37,"col":31}]}},{"name":"reasonRemovedValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1161,"b":1178,"line":37,"col":51}]}},{"name":"newFeatureId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1236,"b":1247,"line":38,"col":30}]}},{"name":"newFeatureIdValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1255,"b":1271,"line":38,"col":49}]}},{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1309,"b":1310,"line":39,"col":12}]}}],"usedParamSet":{"email":true,"emailValue":true,"updatedAt":true,"updatedAtValue":true,"inactive":true,"inactiveValue":true,"lastSeenAt":true,"lastSeenAtValue":true,"preferredName":true,"preferredNameValue":true,"tier":true,"tierValue":true,"picture":true,"pictureValue":true,"segmentId":true,"segmentIdValue":true,"isRemoved":true,"isRemovedValue":true,"reasonRemoved":true,"reasonRemovedValue":true,"newFeatureId":true,"newFeatureIdValue":true,"id":true},"statement":{"body":"UPDATE \"User\" SET\n  email = CASE WHEN :email then :emailValue ELSE email END,\n  \"updatedAt\" = CASE WHEN :updatedAt then :updatedAtValue ELSE \"updatedAt\" END,\n  inactive = CASE WHEN :inactive then :inactiveValue ELSE inactive END,\n  \"lastSeenAt\" = CASE WHEN :lastSeenAt then :lastSeenAtValue ELSE \"lastSeenAt\" END,\n  \"preferredName\" = CASE WHEN :preferredName then :preferredNameValue ELSE \"preferredName\" END,\n  tier = CASE WHEN :tier then :tierValue ELSE tier END,\n  picture = CASE WHEN :picture then :pictureValue ELSE picture END,\n  \"segmentId\" = CASE WHEN :segmentId then :segmentIdValue ELSE \"segmentId\" END,\n  \"isRemoved\" = CASE WHEN :isRemoved then :isRemovedValue ELSE \"isRemoved\" END,\n  \"reasonRemoved\" = CASE WHEN :reasonRemoved then :reasonRemovedValue ELSE \"reasonRemoved\" END,\n  \"newFeatureId\" = CASE WHEN :newFeatureId then :newFeatureIdValue ELSE \"newFeatureId\" END\nWHERE id = :id","loc":{"a":416,"b":1310,"line":27,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "User" SET
 *   email = CASE WHEN :email then :emailValue ELSE email END,
 *   "updatedAt" = CASE WHEN :updatedAt then :updatedAtValue ELSE "updatedAt" END,
 *   inactive = CASE WHEN :inactive then :inactiveValue ELSE inactive END,
 *   "lastSeenAt" = CASE WHEN :lastSeenAt then :lastSeenAtValue ELSE "lastSeenAt" END,
 *   "preferredName" = CASE WHEN :preferredName then :preferredNameValue ELSE "preferredName" END,
 *   tier = CASE WHEN :tier then :tierValue ELSE tier END,
 *   picture = CASE WHEN :picture then :pictureValue ELSE picture END,
 *   "segmentId" = CASE WHEN :segmentId then :segmentIdValue ELSE "segmentId" END,
 *   "isRemoved" = CASE WHEN :isRemoved then :isRemovedValue ELSE "isRemoved" END,
 *   "reasonRemoved" = CASE WHEN :reasonRemoved then :reasonRemovedValue ELSE "reasonRemoved" END,
 *   "newFeatureId" = CASE WHEN :newFeatureId then :newFeatureIdValue ELSE "newFeatureId" END
 * WHERE id = :id
 * ```
 */
export const updateUserQuery = new PreparedQuery<IUpdateUserQueryParams,IUpdateUserQueryResult>(updateUserQueryIR);


