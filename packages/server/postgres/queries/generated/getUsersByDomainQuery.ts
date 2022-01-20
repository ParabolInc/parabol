/** Types generated for queries found in "packages/server/postgres/queries/src/getUsersByDomainQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type AuthTokenRole = 'su';

export type TierEnum = 'enterprise' | 'personal' | 'pro';

export type JsonArray = (null | boolean | number | string | Json[] | { [key: string]: Json })[];

export type stringArray = (string)[];

/** 'GetUsersByDomainQuery' parameters type */
export interface IGetUsersByDomainQueryParams {
  domain: string | null | void;
}

/** 'GetUsersByDomainQuery' return type */
export interface IGetUsersByDomainQueryResult {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  inactive: boolean;
  lastSeenAt: Date;
  preferredName: string;
  tier: TierEnum;
  picture: string;
  tms: stringArray;
  featureFlags: stringArray;
  identities: JsonArray;
  lastSeenAtURLs: stringArray | null;
  segmentId: string | null;
  newFeatureId: string | null;
  overLimitCopy: string | null;
  isRemoved: boolean;
  reasonRemoved: string | null;
  rol: AuthTokenRole | null;
  payLaterClickCount: number;
  isWatched: boolean;
  domain: string | null;
}

/** 'GetUsersByDomainQuery' query type */
export interface IGetUsersByDomainQueryQuery {
  params: IGetUsersByDomainQueryParams;
  result: IGetUsersByDomainQueryResult;
}

const getUsersByDomainQueryIR: any = {"name":"getUsersByDomainQuery","params":[{"name":"domain","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":75,"b":80,"line":5,"col":18}]}}],"usedParamSet":{"domain":true},"statement":{"body":"SELECT * FROM \"User\"\nWHERE \"domain\" = :domain","loc":{"a":36,"b":80,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "User"
 * WHERE "domain" = :domain
 * ```
 */
export const getUsersByDomainQuery = new PreparedQuery<IGetUsersByDomainQueryParams,IGetUsersByDomainQueryResult>(getUsersByDomainQueryIR);


