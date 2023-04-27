/*
  @name insertStripeQuantityMismatchLoggingQuery
*/
INSERT INTO "StripeQuantityMismatchLogging" (
    "orgId",
    "userId",
    "eventTime",
    "eventType",
    "stripePreviousQuantity",
    "stripeNextQuantity",
    "orgUsers"
) VALUES (
    :orgId,
    :userId,
    :eventTime,
    :eventType,
    :stripePreviousQuantity,
    :stripeNextQuantity,
    :orgUsers
);
