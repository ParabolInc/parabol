/*
  @name updateUserQuery
  @param update -> (
    email,
    emailValue,
    updatedAt,
    updatedAtValue,
    inactive,
    inactiveValue,
    lastSeenAt,
    lastSeenAtValue,
    preferredName,
    preferredNameValue,
    tier,
    tierValue,
    picture,
    pictureValue,
    segmentId,
    segmentIdValue,
    isRemoved,
    isRemovedValue,
    reasonRemoved,
    reasonRemovedValue,
    newFeatureId,
    newFeatureIdValue,
    identities,
    identitiesValue,
    overLimitCopy,
    overLimitCopyValue
  )
  @param idValue -> (...)
*/
UPDATE "User" SET
  email = CASE WHEN :email THEN :emailValue ELSE email END,
  "updatedAt" = CASE WHEN :updatedAt THEN :updatedAtValue ELSE "updatedAt" END,
  inactive = CASE WHEN :inactive THEN :inactiveValue ELSE inactive END,
  "lastSeenAt" = CASE WHEN :lastSeenAt THEN :lastSeenAtValue ELSE "lastSeenAt" END,
  "preferredName" = CASE WHEN :preferredName THEN :preferredNameValue ELSE "preferredName" END,
  tier = CASE WHEN :tier THEN :tierValue ELSE tier END,
  picture = CASE WHEN :picture THEN :pictureValue ELSE picture END,
  "segmentId" = CASE WHEN :segmentId THEN :segmentIdValue ELSE "segmentId" END,
  "isRemoved" = CASE WHEN :isRemoved THEN :isRemovedValue ELSE "isRemoved" END,
  "reasonRemoved" = CASE WHEN :reasonRemoved THEN :reasonRemovedValue ELSE "reasonRemoved" END,
  "newFeatureId" = CASE WHEN :newFeatureId THEN :newFeatureIdValue ELSE "newFeatureId" END,
  "identities" = CASE WHEN :identities THEN :identitiesValue ELSE "identities" END,
  "overLimitCopy" = CASE WHEN :overLimitCopy THEN :overLimitCopyValue ELSE "overLimitCopy" END
WHERE (:id = false OR id IN :idValue);
