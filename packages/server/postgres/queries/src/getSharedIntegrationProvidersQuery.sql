/*
 @name getSharedIntegrationProvidersQuery
 @param orgTeamIds -> (...)
 @param teamIds -> (...)
 */
SELECT * FROM "IntegrationProvider"
WHERE "teamId" in :orgTeamIds
AND "service" = :service
AND "isActive" = TRUE
AND ("scope" != 'team' OR "teamId" in :teamIds);
