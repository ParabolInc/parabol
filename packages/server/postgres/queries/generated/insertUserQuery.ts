/** Types generated for queries found in "packages/server/postgres/queries/src/insertUserQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type TierEnum = 'personal' | 'pro' | 'enterprise';

export type stringArray = (string)[];

export type JsonArray = (null | boolean | number | string | Json[] | { [key: string]: Json })[];

/** 'InsertUserQuery' parameters type */
export interface IInsertUserQueryParams {
  users: Array<{
    id: string | null | void,
    email: string | null | void,
    createdAt: Date | null | void,
    updatedAt: Date | null | void,
    inactive: boolean | null | void,
    lastSeenAt: Date | null | void,
    preferredName: string | null | void,
    tier: TierEnum | null | void,
    picture: string | null | void,
    tms: stringArray | null | void,
    featureFlags: stringArray | null | void,
    lastSeenAtURLs: stringArray | null | void,
    segmentId: string | null | void,
    identities: JsonArray | null | void
  }>;
}

/** 'InsertUserQuery' return type */
export type IInsertUserQueryResult = void;

/** 'InsertUserQuery' query type */
export interface IInsertUserQueryQuery {
  params: IInsertUserQueryParams;
  result: IInsertUserQueryResult;
}

const insertUserQueryIR: any = {"name":"insertUserQuery","params":[{"name":"users","codeRefs":{"defined":{"a":36,"b":40,"line":3,"col":9},"used":[{"a":487,"b":491,"line":35,"col":10}]},"transform":{"type":"pick_array_spread","keys":["id","email","createdAt","updatedAt","inactive","lastSeenAt","preferredName","tier","picture","tms","featureFlags","lastSeenAtURLs","segmentId","identities"]}}],"usedParamSet":{"users":true},"statement":{"body":"INSERT INTO \"User\" (\n  \"id\",\n  \"email\",\n  \"createdAt\", \n  \"updatedAt\",\n  \"inactive\",\n  \"lastSeenAt\",\n  \"preferredName\",\n  \"tier\",\n  \"picture\",\n  \"tms\",\n  \"featureFlags\",\n  \"lastSeenAtURLs\",\n  \"segmentId\",\n  \"identities\"\n) VALUES :users","loc":{"a":257,"b":491,"line":20,"col":0}}};

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
 *   "segmentId",
 *   "identities"
 * ) VALUES :users
 * ```
 */
export const insertUserQuery = new PreparedQuery<IInsertUserQueryParams,IInsertUserQueryResult>(insertUserQueryIR);


