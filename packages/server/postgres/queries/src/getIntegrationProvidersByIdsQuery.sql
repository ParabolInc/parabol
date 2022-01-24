/*
 @name getIntegrationProvidersByIdsQuery
 @param ids -> (...)
 */
SELECT * FROM "IntegrationProvider"
WHERE id in :ids
AND "isActive" = TRUE;
