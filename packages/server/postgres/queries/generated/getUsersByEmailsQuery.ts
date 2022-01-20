/** Types generated for queries found in "packages/server/postgres/queries/src/getUsersByEmailsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type AuthTokenRole = 'su';

export type TierEnum = 'enterprise' | 'personal' | 'pro';

export type JsonArray = (null | boolean | number | string | Json[] | { [key: string]: Json })[];

export type stringArray = (string)[];

/** 'GetUsersByEmailsQuery' parameters type */
export interface IGetUsersByEmailsQueryParams {
  emails: readonly (string | null | void)[];
}

/** 'GetUsersByEmailsQuery' return type */
export interface IGetUsersByEmailsQueryResult {
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

/** 'GetUsersByEmailsQuery' query type */
export interface IGetUsersByEmailsQueryQuery {
  params: IGetUsersByEmailsQueryParams;
  result: IGetUsersByEmailsQueryResult;
}

const getUsersByEmailsQueryIR: any = {"name":"getUsersByEmailsQuery","params":[{"name":"emails","codeRefs":{"defined":{"a":42,"b":47,"line":3,"col":9},"used":[{"a":98,"b":103,"line":6,"col":16}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"emails":true},"statement":{"body":"SELECT * FROM \"User\"\nWHERE email in :emails","loc":{"a":61,"b":103,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "User"
 * WHERE email in :emails
 * ```
 */
export const getUsersByEmailsQuery = new PreparedQuery<IGetUsersByEmailsQueryParams,IGetUsersByEmailsQueryResult>(getUsersByEmailsQueryIR);


