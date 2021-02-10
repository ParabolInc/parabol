/** Types generated for queries found in "packages/server/postgres/queries/src/updateUserQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type TierEnum = 'personal' | 'pro' | 'enterprise';

export type JsonArray = (null | boolean | number | string | Json[] | { [key: string]: Json })[];

/** 'UpdateUserQuery' parameters type */
export interface IUpdateUserQueryParams {
  idValue: Array<string | null | void>;
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
  identities: boolean | null | void;
  identitiesValue: JsonArray | null | void;
  overLimitCopy: boolean | null | void;
  overLimitCopyValue: string | null | void;
  id: boolean | null | void;
}

/** 'UpdateUserQuery' return type */
export type IUpdateUserQueryResult = void;

/** 'UpdateUserQuery' query type */
export interface IUpdateUserQueryQuery {
  params: IUpdateUserQueryParams;
  result: IUpdateUserQueryResult;
}

const updateUserQueryIR: any = {"name":"updateUserQuery","params":[{"name":"update","codeRefs":{"defined":{"a":36,"b":41,"line":3,"col":9},"used":[]},"transform":{"type":"pick_tuple","keys":["email","emailValue","updatedAt","updatedAtValue","inactive","inactiveValue","lastSeenAt","lastSeenAtValue","preferredName","preferredNameValue","tier","tierValue","picture","pictureValue","segmentId","segmentIdValue","isRemoved","isRemovedValue","reasonRemoved","reasonRemovedValue","newFeatureId","newFeatureIdValue","identities","identitiesValue","overLimitCopy","overLimitCopyValue"]}},{"name":"idValue","codeRefs":{"defined":{"a":525,"b":531,"line":31,"col":9},"used":[{"a":1635,"b":1641,"line":47,"col":29}]},"transform":{"type":"array_spread"}},{"name":"email","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":584,"b":588,"line":34,"col":21}]}},{"name":"emailValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":596,"b":605,"line":34,"col":33}]}},{"name":"updatedAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":650,"b":658,"line":35,"col":27}]}},{"name":"updatedAtValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":666,"b":679,"line":35,"col":43}]}},{"name":"inactive","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":727,"b":734,"line":36,"col":24}]}},{"name":"inactiveValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":742,"b":754,"line":36,"col":39}]}},{"name":"lastSeenAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":803,"b":812,"line":37,"col":28}]}},{"name":"lastSeenAtValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":820,"b":834,"line":37,"col":45}]}},{"name":"preferredName","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":890,"b":902,"line":38,"col":31}]}},{"name":"preferredNameValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":910,"b":927,"line":38,"col":51}]}},{"name":"tier","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":975,"b":978,"line":39,"col":20}]}},{"name":"tierValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":986,"b":994,"line":39,"col":31}]}},{"name":"picture","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1034,"b":1040,"line":40,"col":23}]}},{"name":"pictureValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1048,"b":1059,"line":40,"col":37}]}},{"name":"segmentId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1106,"b":1114,"line":41,"col":27}]}},{"name":"segmentIdValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1122,"b":1135,"line":41,"col":43}]}},{"name":"isRemoved","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1186,"b":1194,"line":42,"col":27}]}},{"name":"isRemovedValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1202,"b":1215,"line":42,"col":43}]}},{"name":"reasonRemoved","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1270,"b":1282,"line":43,"col":31}]}},{"name":"reasonRemovedValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1290,"b":1307,"line":43,"col":51}]}},{"name":"newFeatureId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1365,"b":1376,"line":44,"col":30}]}},{"name":"newFeatureIdValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1384,"b":1400,"line":44,"col":49}]}},{"name":"identities","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1455,"b":1464,"line":45,"col":28}]}},{"name":"identitiesValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1472,"b":1486,"line":45,"col":45}]}},{"name":"overLimitCopy","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1542,"b":1554,"line":46,"col":31}]}},{"name":"overLimitCopyValue","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1562,"b":1579,"line":46,"col":51}]}},{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1614,"b":1615,"line":47,"col":8}]}}],"usedParamSet":{"email":true,"emailValue":true,"updatedAt":true,"updatedAtValue":true,"inactive":true,"inactiveValue":true,"lastSeenAt":true,"lastSeenAtValue":true,"preferredName":true,"preferredNameValue":true,"tier":true,"tierValue":true,"picture":true,"pictureValue":true,"segmentId":true,"segmentIdValue":true,"isRemoved":true,"isRemovedValue":true,"reasonRemoved":true,"reasonRemovedValue":true,"newFeatureId":true,"newFeatureIdValue":true,"identities":true,"identitiesValue":true,"overLimitCopy":true,"overLimitCopyValue":true,"id":true,"idValue":true},"statement":{"body":"UPDATE \"User\" SET\n  email = CASE WHEN :email THEN :emailValue ELSE email END,\n  \"updatedAt\" = CASE WHEN :updatedAt THEN :updatedAtValue ELSE \"updatedAt\" END,\n  inactive = CASE WHEN :inactive THEN :inactiveValue ELSE inactive END,\n  \"lastSeenAt\" = CASE WHEN :lastSeenAt THEN :lastSeenAtValue ELSE \"lastSeenAt\" END,\n  \"preferredName\" = CASE WHEN :preferredName THEN :preferredNameValue ELSE \"preferredName\" END,\n  tier = CASE WHEN :tier THEN :tierValue ELSE tier END,\n  picture = CASE WHEN :picture THEN :pictureValue ELSE picture END,\n  \"segmentId\" = CASE WHEN :segmentId THEN :segmentIdValue ELSE \"segmentId\" END,\n  \"isRemoved\" = CASE WHEN :isRemoved THEN :isRemovedValue ELSE \"isRemoved\" END,\n  \"reasonRemoved\" = CASE WHEN :reasonRemoved THEN :reasonRemovedValue ELSE \"reasonRemoved\" END,\n  \"newFeatureId\" = CASE WHEN :newFeatureId THEN :newFeatureIdValue ELSE \"newFeatureId\" END,\n  \"identities\" = CASE WHEN :identities THEN :identitiesValue ELSE \"identities\" END,\n  \"overLimitCopy\" = CASE WHEN :overLimitCopy THEN :overLimitCopyValue ELSE \"overLimitCopy\" END\nWHERE (:id = false OR id IN :idValue)","loc":{"a":545,"b":1642,"line":33,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "User" SET
 *   email = CASE WHEN :email THEN :emailValue ELSE email END,
 *   "updatedAt" = CASE WHEN :updatedAt THEN :updatedAtValue ELSE "updatedAt" END,
 *   inactive = CASE WHEN :inactive THEN :inactiveValue ELSE inactive END,
 *   "lastSeenAt" = CASE WHEN :lastSeenAt THEN :lastSeenAtValue ELSE "lastSeenAt" END,
 *   "preferredName" = CASE WHEN :preferredName THEN :preferredNameValue ELSE "preferredName" END,
 *   tier = CASE WHEN :tier THEN :tierValue ELSE tier END,
 *   picture = CASE WHEN :picture THEN :pictureValue ELSE picture END,
 *   "segmentId" = CASE WHEN :segmentId THEN :segmentIdValue ELSE "segmentId" END,
 *   "isRemoved" = CASE WHEN :isRemoved THEN :isRemovedValue ELSE "isRemoved" END,
 *   "reasonRemoved" = CASE WHEN :reasonRemoved THEN :reasonRemovedValue ELSE "reasonRemoved" END,
 *   "newFeatureId" = CASE WHEN :newFeatureId THEN :newFeatureIdValue ELSE "newFeatureId" END,
 *   "identities" = CASE WHEN :identities THEN :identitiesValue ELSE "identities" END,
 *   "overLimitCopy" = CASE WHEN :overLimitCopy THEN :overLimitCopyValue ELSE "overLimitCopy" END
 * WHERE (:id = false OR id IN :idValue)
 * ```
 */
export const updateUserQuery = new PreparedQuery<IUpdateUserQueryParams,IUpdateUserQueryResult>(updateUserQueryIR);


