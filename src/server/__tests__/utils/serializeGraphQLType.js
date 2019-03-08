const fieldsToSerialize = {
  NotificationsClearedPayload: ['deletedIds']
}

const serializeGraphQLType = (actualResult, type, dynamicSerializer) => {
  const typeMap = fieldsToSerialize[type]
  if (!typeMap) {
    throw new Error(`BAD MOCK: No fieldsToSerialize for GraphQL type ${type}`)
  }
  return dynamicSerializer.toStatic(actualResult, typeMap)
}

export default serializeGraphQLType
