/*
 @name upsertGlobalIntegrationProviderQuery
 */
INSERT INTO "IntegrationProvider" (
  "type",
	"tokenType",
	"scope",
	"isActive",
	"name",
	"providerMetadata"
  ) VALUES (
	  :type,
		'oauth2'::"IntegrationProviderTokenTypeEnum",
		'global'::"IntegrationProviderScopesEnum",
		TRUE,
		:name,
		:providerMetadata
	)
	ON CONFLICT ("scopeGlobal", "type")
  DO UPDATE
    SET (
		  "type",
		  "tokenType",
		  "scope",
			"isActive",
			"name",
			"providerMetadata",
			"updatedAt") = (
			EXCLUDED."type",
		  'oauth2'::"IntegrationProviderTokenTypeEnum",
		  'global'::"IntegrationProviderScopesEnum",
			TRUE,
			EXCLUDED."name",
			EXCLUDED."providerMetadata",
			CURRENT_TIMESTAMP
		);
