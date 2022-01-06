/*
 @name upsertIntegrationTokenQuery
 @param auth -> (tokenMetadata, providerId, teamId, userId, service)
 */
INSERT INTO
  "IntegrationToken" (
    "tokenMetadata",
    "providerId",
    "teamId",
    "userId",
    "service"
  )
VALUES
  :auth ON CONFLICT ("providerId", "userId", "teamId") DO
UPDATE
SET
  (
    "tokenMetadata",
    "providerId",
    "isActive",
    "updatedAt"
  ) = (
    EXCLUDED."tokenMetadata",
    EXCLUDED."providerId",
    TRUE,
    CURRENT_TIMESTAMP
  );
