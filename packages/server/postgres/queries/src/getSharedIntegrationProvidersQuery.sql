/*
 @name getSharedIntegrationProvidersQuery
 @param orgIds -> (...)
 @param teamIds -> (...)
 */
SELECT * FROM "IntegrationProvider"
WHERE "service" = :service
AND "isActive" = TRUE
AND ("scope" != 'team' OR "teamId" in :teamIds)
AND ("scope" != 'org' OR "orgId" in :orgIds);
