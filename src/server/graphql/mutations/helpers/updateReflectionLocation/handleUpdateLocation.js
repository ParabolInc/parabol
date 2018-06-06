import addReflectionToGroup from 'server/graphql/mutations/helpers/updateReflectionLocation/addReflectionToGroup'
import removeReflectionFromGroup from 'server/graphql/mutations/helpers/updateReflectionLocation/removeReflectionFromGroup'
import moveReflectionGroup from 'server/graphql/mutations/helpers/updateReflectionLocation/moveReflectionGroup'

const handleUpdatedLocation = (reflectionId, reflectionGroupId, sortOrder, context) => {
  // adding/reordering within the same group requires reflectionId and reflectionGroupId
  // removing from group (into its own new group) requires reflectionId and a null reflectionGroupId
  // moving a group requires reflectionGroupId and a null reflectionId
  if (reflectionId && reflectionGroupId) {
    return addReflectionToGroup(reflectionId, reflectionGroupId, sortOrder, context)
  }
  if (reflectionId && !reflectionGroupId) {
    return removeReflectionFromGroup(reflectionId, sortOrder, context)
  }
  if (!reflectionId && reflectionGroupId) {
    return moveReflectionGroup(reflectionGroupId, sortOrder, context)
  }
  return undefined
}

export default handleUpdatedLocation
