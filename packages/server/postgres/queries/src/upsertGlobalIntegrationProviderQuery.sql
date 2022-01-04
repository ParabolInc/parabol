/*
 @name upsertGlobalIntegrationProviderQuery
 */
INSERT INTO
	"IntegrationProvider" (
		"service",
		"type",
		"scope",
		"isActive",
		"providerMetadata"
	)
VALUES
	(
		:service,
		'oauth2' :: "IntegrationProviderTypeEnum",
		'global' :: "IntegrationProviderScopeEnum",
		TRUE,
		:providerMetadata
	) ON CONFLICT ("scopeGlobal", "service") DO
UPDATE
SET
	(
		"service",
		"type",
		"scope",
		"isActive",
		"providerMetadata",
		"updatedAt"
	) = (
		EXCLUDED."service",
		'oauth2' :: "IntegrationProviderTypeEnum",
		'global' :: "IntegrationProviderScopeEnum",
		TRUE,
		EXCLUDED."providerMetadata",
		CURRENT_TIMESTAMP
	);
