/*
 @name upsertGlobalIntegrationProviderQuery
 */
INSERT INTO
	"IntegrationProvider" (
		"provider",
		"type",
		"scope",
		"isActive",
		"name",
		"providerMetadata"
	)
VALUES
	(
		:provider,
		'oauth2' :: "IntegrationProviderTypesEnum",
		'global' :: "IntegrationProviderScopesEnum",
		TRUE,
		:name,
		:providerMetadata
	) ON CONFLICT ("scopeGlobal", "provider") DO
UPDATE
SET
	(
		"provider",
		"type",
		"scope",
		"isActive",
		"name",
		"providerMetadata",
		"updatedAt"
	) = (
		EXCLUDED."provider",
		'oauth2' :: "IntegrationProviderTypesEnum",
		'global' :: "IntegrationProviderScopesEnum",
		TRUE,
		EXCLUDED."name",
		EXCLUDED."providerMetadata",
		CURRENT_TIMESTAMP
	);
