/*
  @name getIntegrationProvidersQuery
*/
SELECT * FROM "IntegrationProvider"
  WHERE "type" = :type
    AND "isActive" = TRUE
    AND (
        "scope" = 'GLOBAL'
    OR ("scope" = 'ORG' AND "orgId" = :orgId)
    OR ("scope" = 'TEAM' AND "teamId" = :teamId)	
);