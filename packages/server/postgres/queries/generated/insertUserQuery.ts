/** Types generated for queries found in "packages/server/postgres/queries/src/insertUserQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type TierEnum = 'personal' | 'pro' | 'enterprise';

export type stringArray = (string)[];

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'InsertUserQuery' parameters type */
export interface IInsertUserQueryParams {
  id: string | null | void;
  email: string | null | void;
  createdAt: Date | null | void;
  updatedAt: Date | null | void;
  inactive: boolean | null | void;
  lastSeenAt: Date | null | void;
  preferredName: string | null | void;
  tier: TierEnum | null | void;
  picture: string | null | void;
  tms: stringArray | null | void;
  featureFlags: stringArray | null | void;
  lastSeenAtURLs: stringArray | null | void;
  identities: Json | null | void;
}

/** 'InsertUserQuery' return type */
export type IInsertUserQueryResult = void;

/** 'InsertUserQuery' query type */
export interface IInsertUserQueryQuery {
  params: IInsertUserQueryParams;
  result: IInsertUserQueryResult;
}

const insertUserQueryIR: any = {"name":"insertUserQuery","params":[{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":249,"b":250,"line":19,"col":3}]}},{"name":"email","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":256,"b":260,"line":20,"col":3},{"a":460,"b":464,"line":34,"col":11}]}},{"name":"createdAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":266,"b":274,"line":21,"col":3},{"a":484,"b":492,"line":35,"col":17}]}},{"name":"updatedAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":280,"b":288,"line":22,"col":3},{"a":512,"b":520,"line":36,"col":17}]}},{"name":"inactive","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":294,"b":301,"line":23,"col":3},{"a":537,"b":544,"line":37,"col":14}]}},{"name":"lastSeenAt","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":307,"b":316,"line":24,"col":3},{"a":565,"b":574,"line":38,"col":18}]}},{"name":"preferredName","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":322,"b":334,"line":25,"col":3},{"a":598,"b":610,"line":39,"col":21}]}},{"name":"tier","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":340,"b":343,"line":26,"col":3},{"a":623,"b":626,"line":40,"col":10}]}},{"name":"picture","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":349,"b":355,"line":27,"col":3},{"a":642,"b":648,"line":41,"col":13}]}},{"name":"tms","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":361,"b":363,"line":28,"col":3},{"a":660,"b":662,"line":42,"col":9}]}},{"name":"featureFlags","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":369,"b":380,"line":29,"col":3},{"a":685,"b":696,"line":43,"col":20}]}},{"name":"lastSeenAtURLs","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":386,"b":399,"line":30,"col":3},{"a":721,"b":734,"line":44,"col":22}]}},{"name":"identities","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":405,"b":414,"line":31,"col":3},{"a":753,"b":762,"line":45,"col":16}]}}],"usedParamSet":{"id":true,"email":true,"createdAt":true,"updatedAt":true,"inactive":true,"lastSeenAt":true,"preferredName":true,"tier":true,"picture":true,"tms":true,"featureFlags":true,"lastSeenAtURLs":true,"identities":true},"statement":{"body":"INSERT INTO \"User\" (\n  \"id\",\n  \"email\",\n  \"createdAt\", \n  \"updatedAt\",\n  \"inactive\",\n  \"lastSeenAt\",\n  \"preferredName\",\n  \"tier\",\n  \"picture\",\n  \"tms\",\n  \"featureFlags\",\n  \"lastSeenAtURLs\",\n  \"identities\"\n) VALUES (\n  :id,\n  :email,\n  :createdAt,\n  :updatedAt,\n  :inactive,\n  :lastSeenAt,\n  :preferredName,\n  :tier,\n  :picture,\n  :tms,\n  :featureFlags,\n  :lastSeenAtURLs,\n  :identities\n)\nON CONFLICT (id) DO UPDATE SET\n  email = :email,\n  \"createdAt\" = :createdAt,\n  \"updatedAt\" = :updatedAt,\n  inactive = :inactive,\n  \"lastSeenAt\" = :lastSeenAt,\n  \"preferredName\" = :preferredName,\n  tier = :tier,\n  picture = :picture,\n  tms = :tms,\n  \"featureFlags\" = :featureFlags,\n  \"lastSeenAtURLs\" = :lastSeenAtURLs,\n  identities = :identities,\n  \"segmentId\" = DEFAULT,\n  \"newFeatureId\" = DEFAULT,\n  \"overLimitCopy\" = DEFAULT,\n  \"isRemoved\" = DEFAULT,\n  \"reasonRemoved\" = DEFAULT,\n  rol = DEFAULT,\n  \"payLaterClickCount\" = DEFAULT","loc":{"a":30,"b":949,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "User" (
 *   "id",
 *   "email",
 *   "createdAt", 
 *   "updatedAt",
 *   "inactive",
 *   "lastSeenAt",
 *   "preferredName",
 *   "tier",
 *   "picture",
 *   "tms",
 *   "featureFlags",
 *   "lastSeenAtURLs",
 *   "identities"
 * ) VALUES (
 *   :id,
 *   :email,
 *   :createdAt,
 *   :updatedAt,
 *   :inactive,
 *   :lastSeenAt,
 *   :preferredName,
 *   :tier,
 *   :picture,
 *   :tms,
 *   :featureFlags,
 *   :lastSeenAtURLs,
 *   :identities
 * )
 * ON CONFLICT (id) DO UPDATE SET
 *   email = :email,
 *   "createdAt" = :createdAt,
 *   "updatedAt" = :updatedAt,
 *   inactive = :inactive,
 *   "lastSeenAt" = :lastSeenAt,
 *   "preferredName" = :preferredName,
 *   tier = :tier,
 *   picture = :picture,
 *   tms = :tms,
 *   "featureFlags" = :featureFlags,
 *   "lastSeenAtURLs" = :lastSeenAtURLs,
 *   identities = :identities,
 *   "segmentId" = DEFAULT,
 *   "newFeatureId" = DEFAULT,
 *   "overLimitCopy" = DEFAULT,
 *   "isRemoved" = DEFAULT,
 *   "reasonRemoved" = DEFAULT,
 *   rol = DEFAULT,
 *   "payLaterClickCount" = DEFAULT
 * ```
 */
export const insertUserQuery = new PreparedQuery<IInsertUserQueryParams,IInsertUserQueryResult>(insertUserQueryIR);


