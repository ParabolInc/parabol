/*
  @name getIntegrationProvidersQuery
*/
SELECT * FROM "IntegrationProvider"
  WHERE "providerType" = :providerType
    AND "isActive" = TRUE
    AND (
        "providerScope" = 'GLOBAL'
    OR ("providerScope" = 'ORG' AND "orgId" = :orgId)
    OR ("providerScope" = 'TEAM' AND "teamId" = :teamId)	
);