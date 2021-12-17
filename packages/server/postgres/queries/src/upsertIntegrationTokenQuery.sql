/*
  @name upsertIntegrationTokenQuery
  @param auth -> (tokenMetadata, providerId, teamId, userId)
*/
INSERT INTO "IntegrationToken" ("tokenMetadata", "providerId", "teamId", "userId")
  VALUES :auth
  ON CONFLICT ("providerId", "userId", "teamId")
  DO UPDATE
  SET ("tokenMetadata", "providerId", "isActive", "updatedAt") = (
    EXCLUDED."tokenMetadata",
    EXCLUDED."providerId",
    TRUE,
    CURRENT_TIMESTAMP
  ) RETURNING *;
