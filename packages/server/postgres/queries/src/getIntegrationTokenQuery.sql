/*
 @name getIntegrationTokenQuery
 */
SELECT * FROM "IntegrationToken"
WHERE "teamId" = :teamId
AND "userId" = :userId
AND "service" = :service
AND "isActive" = TRUE;
