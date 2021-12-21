/*
 @name insertIntegrationProviderWithTokenQuery
 @param provider -> (type, tokenType, scope, name, providerMetadata, orgId, teamId)
 */
WITH providerRow AS (
  INSERT INTO
    "IntegrationProvider" (
      "type",
      "tokenType",
      "scope",
      "name",
      "providerMetadata",
      "orgId",
      "teamId"
    )
  VALUES
    :provider RETURNING *
)
INSERT INTO
  "IntegrationToken" (
    "teamId",
    "userId",
    "providerId",
    "tokenMetadata"
  )
SELECT
  *
FROM
  (
    VALUES
      (
        (
          SELECT
            "teamId"
          FROM
            providerRow
        ),
        :userId,
        (
          SELECT
            "id"
          FROM
            providerRow
        ),
        :tokenMetadata :: jsonb
      )
  ) AS "integrationToken" ON CONFLICT ("providerId", "userId", "teamId") DO
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
  ) RETURNING "providerId" AS "id";
