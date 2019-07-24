import addReflectionToGroup from './addReflectionToGroup'
import removeReflectionFromGroup from './removeReflectionFromGroup'
// import moveReflectionGroup from 'server/graphql/mutations/helpers/updateReflectionLocation/moveReflectionGroup'

const handleUpdatedLocation = (reflectionId, reflectionGroupId, context) => {
  // adding/reordering within the same group requires reflectionId and reflectionGroupId
  if (reflectionId && reflectionGroupId) {
    return addReflectionToGroup(reflectionId, reflectionGroupId, context)
  }
  // removing from group (into its own new group) requires reflectionId and a null reflectionGroupId
  if (reflectionId && !reflectionGroupId) {
    return removeReflectionFromGroup(reflectionId, context)
  }
  // moving a group requires reflectionGroupId and a null reflectionId
  // if (!reflectionId && reflectionGroupId) {
  //   return moveReflectionGroup(reflectionGroupId, sortOrder, context)
  // }
  return undefined
}

export default handleUpdatedLocation
