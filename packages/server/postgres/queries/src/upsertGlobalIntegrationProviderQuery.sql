/*
 @name upsertGlobalIntegrationProviderQuery
 */
INSERT INTO "IntegrationProvider" (
  "type",
	"tokenType",
	"scope",
	"isActive",
	"name",
	"serverBaseUri",
	"oauthScopes",
	"oauthClientId",
	"oauthClientSecret"
  ) VALUES (
	  :type,
		'oauth2'::"IntegrationProviderTokenTypeEnum",
		'global'::"IntegrationProviderScopesEnum",
		TRUE,
		:name,
		:serverBaseUri,
		:oauthScopes,
		:oauthClientId,
		:oauthClientSecret
	)
	ON CONFLICT ("scopeGlobal", "type")
  DO UPDATE
    SET (
		  "type",
		  "tokenType",
		  "scope",
			"isActive",
			"name",
			"serverBaseUri",
			"oauthScopes",
			"oauthClientId",
			"oauthClientSecret",
			"updatedAt") = (
			EXCLUDED."type",
		  'oauth2'::"IntegrationProviderTokenTypeEnum",
		  'global'::"IntegrationProviderScopesEnum",
			TRUE,
			EXCLUDED."name",
			EXCLUDED."serverBaseUri",
			EXCLUDED."oauthScopes",
			EXCLUDED."oauthClientId",
			EXCLUDED."oauthClientSecret",
			CURRENT_TIMESTAMP
		);