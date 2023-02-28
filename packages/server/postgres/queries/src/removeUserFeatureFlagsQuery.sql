/*
  @name removeUserFeatureFlagsQuery
  @param ids -> (...)
*/
UPDATE "User"
SET "featureFlags" = array_remove("featureFlags", x)
FROM (
SELECT id, unnest("featureFlags") as x
FROM "User"
WHERE id IN :ids
) sub
WHERE "User".id = sub.id AND x = :flag;
