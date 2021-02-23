/** Types generated for queries found in "packages/server/postgres/queries/src/backupUserQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type TierEnum = 'personal' | 'pro' | 'enterprise';

export type AuthTokenRole = 'su';

export type stringArray = (string)[];

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'BackupUserQuery' parameters type */
export interface IBackupUserQueryParams {
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
    identities: Json | null | void,
    segmentId: string | null | void,
    newFeatureId: string | null | void,
    overLimitCopy: string | null | void,
    isRemoved: boolean | null | void,
    reasonRemoved: string | null | void,
    rol: AuthTokenRole | null | void,
    payLaterClickCount: number | null | void
  }>;
}

/** 'BackupUserQuery' return type */
export type IBackupUserQueryResult = void;

/** 'BackupUserQuery' query type */
export interface IBackupUserQueryQuery {
  params: IBackupUserQueryParams;
  result: IBackupUserQueryResult;
}

const backupUserQueryIR: any = {"name":"backupUserQuery","params":[{"name":"users","codeRefs":{"defined":{"a":36,"b":40,"line":3,"col":9},"used":[{"a":696,"b":700,"line":47,"col":10}]},"transform":{"type":"pick_array_spread","keys":["id","email","createdAt","updatedAt","inactive","lastSeenAt","preferredName","tier","picture","tms","featureFlags","lastSeenAtURLs","identities","segmentId","newFeatureId","overLimitCopy","isRemoved","reasonRemoved","rol","payLaterClickCount"]}}],"usedParamSet":{"users":true},"statement":{"body":"INSERT INTO \"User\" ( \n  \"id\",\n  \"email\",\n  \"createdAt\", \n  \"updatedAt\",\n  \"inactive\",\n  \"lastSeenAt\",\n  \"preferredName\",\n  \"tier\",\n  \"picture\",\n  \"tms\",\n  \"featureFlags\",\n  \"lastSeenAtURLs\",\n  \"identities\",\n  \"segmentId\",\n  \"newFeatureId\",\n  \"overLimitCopy\",\n  \"isRemoved\",\n  \"reasonRemoved\",\n  \"rol\",\n  \"payLaterClickCount\"\n) VALUES :users","loc":{"a":361,"b":700,"line":26,"col":0}}};

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
 *   "identities",
 *   "segmentId",
 *   "newFeatureId",
 *   "overLimitCopy",
 *   "isRemoved",
 *   "reasonRemoved",
 *   "rol",
 *   "payLaterClickCount"
 * ) VALUES :users
 * ```
 */
export const backupUserQuery = new PreparedQuery<IBackupUserQueryParams,IBackupUserQueryResult>(backupUserQueryIR);


