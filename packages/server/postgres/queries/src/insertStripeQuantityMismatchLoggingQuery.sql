/*
  @name insertStripeQuantityMismatchLoggingQuery
*/
INSERT INTO "StripeQuantityMismatchLogging" (
    "userId",
    "eventTime",
    "eventType",
    "stripePreviousQuantity",
    "stripeNextQuantity",
    "orgUsers"
) VALUES (
    :userId,
    :eventTime,
    :eventType,
    :stripePreviousQuantity,
    :stripeNextQuantity,
    :orgUsers
);
