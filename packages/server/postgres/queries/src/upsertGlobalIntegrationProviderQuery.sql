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
		'OAUTH2'::"IntegrationProviderTokenTypeEnum",
		'GLOBAL'::"IntegrationProviderScopesEnum",
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
		  'OAUTH2'::"IntegrationProviderTokenTypeEnum",
		  'GLOBAL'::"IntegrationProviderScopesEnum",
			TRUE,
			EXCLUDED."name",
			EXCLUDED."serverBaseUri",
			EXCLUDED."oauthScopes",
			EXCLUDED."oauthClientId",
			EXCLUDED."oauthClientSecret",
			CURRENT_TIMESTAMP
		);