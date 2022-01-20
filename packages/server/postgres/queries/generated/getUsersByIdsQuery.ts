/** Types generated for queries found in "packages/server/postgres/queries/src/getUsersByIdsQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type AuthTokenRole = 'su';

export type TierEnum = 'enterprise' | 'personal' | 'pro';

export type JsonArray = (null | boolean | number | string | Json[] | { [key: string]: Json })[];

export type stringArray = (string)[];

/** 'GetUsersByIdsQuery' parameters type */
export interface IGetUsersByIdsQueryParams {
  ids: readonly (string | null | void)[];
}

/** 'GetUsersByIdsQuery' return type */
export interface IGetUsersByIdsQueryResult {
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

/** 'GetUsersByIdsQuery' query type */
export interface IGetUsersByIdsQueryQuery {
  params: IGetUsersByIdsQueryParams;
  result: IGetUsersByIdsQueryResult;
}

const getUsersByIdsQueryIR: any = {"name":"getUsersByIdsQuery","params":[{"name":"ids","codeRefs":{"defined":{"a":39,"b":41,"line":3,"col":9},"used":[{"a":89,"b":91,"line":6,"col":13}]},"transform":{"type":"array_spread"}}],"usedParamSet":{"ids":true},"statement":{"body":"SELECT * FROM \"User\"\nWHERE id IN :ids","loc":{"a":55,"b":91,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM "User"
 * WHERE id IN :ids
 * ```
 */
export const getUsersByIdsQuery = new PreparedQuery<IGetUsersByIdsQueryParams,IGetUsersByIdsQueryResult>(getUsersByIdsQueryIR);


