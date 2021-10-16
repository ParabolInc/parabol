/*
 @name upsertGlobalIntegrationProviderQuery
 */
INSERT INTO "IntegrationProvider" (
  "providerType",
	"providerTokenType",
	"providerScope",
	"isActive",
	"name",
	"serverBaseUri",
	"scopes",
	"oauthClientId",
	"oauthClientSecret"
  ) VALUES (
	  :providerType,
		'OAUTH2'::"IntegrationProviderTokenTypeEnum",
		'GLOBAL'::"IntegrationProviderScopesEnum",
		TRUE,
		:name,
		:serverBaseUri,
		:scopes,
		:oauthClientId,
		:oauthClientSecret
	)
	ON CONFLICT ("providerScopeGlobal", "providerType")
  DO UPDATE
    SET (
		  "providerType",
		  "providerTokenType",
		  "providerScope",
			"isActive",
			"name",
			"serverBaseUri",
			"scopes",
			"oauthClientId",
			"oauthClientSecret",
			"updatedAt") = (
			EXCLUDED."providerType",
		  'OAUTH2'::"IntegrationProviderTokenTypeEnum",
		  'GLOBAL'::"IntegrationProviderScopesEnum",
			TRUE,
			EXCLUDED."name",
			EXCLUDED."serverBaseUri",
			EXCLUDED."scopes",
			EXCLUDED."oauthClientId",
			EXCLUDED."oauthClientSecret",
			CURRENT_TIMESTAMP
		);