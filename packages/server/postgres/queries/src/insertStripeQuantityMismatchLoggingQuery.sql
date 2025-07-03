/*
  @name insertStripeQuantityMismatchLoggingQuery
*/
INSERT INTO "StripeQuantityMismatchLogging" (
    "orgId",
    "userId",
    "eventTime",
    "eventType",
    "stripePreviousQuantity",
    "stripeNextQuantity"
) VALUES (
    :orgId,
    :userId,
    :eventTime,
    :eventType,
    :stripePreviousQuantity,
    :stripeNextQuantity,
);
