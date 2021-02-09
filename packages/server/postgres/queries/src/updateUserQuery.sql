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
  email = CASE WHEN :email then :emailValue ELSE email END,
  "updatedAt" = CASE WHEN :updatedAt then :updatedAtValue ELSE "updatedAt" END,
  inactive = CASE WHEN :inactive then :inactiveValue ELSE inactive END,
  "lastSeenAt" = CASE WHEN :lastSeenAt then :lastSeenAtValue ELSE "lastSeenAt" END,
  "preferredName" = CASE WHEN :preferredName then :preferredNameValue ELSE "preferredName" END,
  tier = CASE WHEN :tier then :tierValue ELSE tier END,
  picture = CASE WHEN :picture then :pictureValue ELSE picture END,
  "segmentId" = CASE WHEN :segmentId then :segmentIdValue ELSE "segmentId" END,
  "isRemoved" = CASE WHEN :isRemoved then :isRemovedValue ELSE "isRemoved" END,
  "reasonRemoved" = CASE WHEN :reasonRemoved then :reasonRemovedValue ELSE "reasonRemoved" END,
  "newFeatureId" = CASE WHEN :newFeatureId then :newFeatureIdValue ELSE "newFeatureId" END,
  "identities" = CASE WHEN :identities then :identitiesValue ELSE "identities" END,
  "overLimitCopy" = CASE WHEN :overLimitCopy then :overLimitCopyValue ELSE "overLimitCopy" END
WHERE (:id = false OR id IN :idValue);
