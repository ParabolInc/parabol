/** Types generated for queries found in "packages/server/postgres/queries/src/insertStripeQuantityMismatchLoggingQuery.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type JsonArray = (null | boolean | number | string | Json[] | { [key: string]: Json })[];

/** 'InsertStripeQuantityMismatchLoggingQuery' parameters type */
export interface IInsertStripeQuantityMismatchLoggingQueryParams {
  userId: string | null | void;
  eventTime: Date | null | void;
  eventType: string | null | void;
  stripePreviousQuantity: number | null | void;
  stripeNextQuantity: number | null | void;
  orgUsers: JsonArray | null | void;
}

/** 'InsertStripeQuantityMismatchLoggingQuery' return type */
export type IInsertStripeQuantityMismatchLoggingQueryResult = void;

/** 'InsertStripeQuantityMismatchLoggingQuery' query type */
export interface IInsertStripeQuantityMismatchLoggingQueryQuery {
  params: IInsertStripeQuantityMismatchLoggingQueryParams;
  result: IInsertStripeQuantityMismatchLoggingQueryResult;
}

const insertStripeQuantityMismatchLoggingQueryIR: any = {"name":"insertStripeQuantityMismatchLoggingQuery","params":[{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":236,"b":241,"line":12,"col":5}]}},{"name":"eventTime","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":249,"b":257,"line":13,"col":5}]}},{"name":"eventType","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":265,"b":273,"line":14,"col":5}]}},{"name":"stripePreviousQuantity","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":281,"b":302,"line":15,"col":5}]}},{"name":"stripeNextQuantity","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":310,"b":327,"line":16,"col":5}]}},{"name":"orgUsers","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":335,"b":342,"line":17,"col":5}]}}],"usedParamSet":{"userId":true,"eventTime":true,"eventType":true,"stripePreviousQuantity":true,"stripeNextQuantity":true,"orgUsers":true},"statement":{"body":"INSERT INTO \"StripeQuantityMismatchLogging\" (\n    \"userId\",\n    \"eventTime\",\n    \"eventType\",\n    \"stripePreviousQuantity\",\n    \"stripeNextQuantity\",\n    \"orgUsers\"\n) VALUES (\n    :userId,\n    :eventTime,\n    :eventType,\n    :stripePreviousQuantity,\n    :stripeNextQuantity,\n    :orgUsers\n)","loc":{"a":55,"b":344,"line":4,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "StripeQuantityMismatchLogging" (
 *     "userId",
 *     "eventTime",
 *     "eventType",
 *     "stripePreviousQuantity",
 *     "stripeNextQuantity",
 *     "orgUsers"
 * ) VALUES (
 *     :userId,
 *     :eventTime,
 *     :eventType,
 *     :stripePreviousQuantity,
 *     :stripeNextQuantity,
 *     :orgUsers
 * )
 * ```
 */
export const insertStripeQuantityMismatchLoggingQuery = new PreparedQuery<IInsertStripeQuantityMismatchLoggingQueryParams,IInsertStripeQuantityMismatchLoggingQueryResult>(insertStripeQuantityMismatchLoggingQueryIR);


