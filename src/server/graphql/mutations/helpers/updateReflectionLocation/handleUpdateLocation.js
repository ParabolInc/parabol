import addReflectionToGroup from 'server/graphql/mutations/helpers/updateReflectionLocation/addReflectionToGroup';
import removeReflectionFromGroup from 'server/graphql/mutations/helpers/updateReflectionLocation/removeReflectionFromGroup';
import moveReflectionGroup from 'server/graphql/mutations/helpers/updateReflectionLocation/moveReflectionGroup';

const handleUpdatedLocation = (reflectionId, reflectionGroupId, retroPhaseItemId, sortOrder, context) => {
  // adding to group requires reflectionId and reflectionGroupId
  // removing from group (into a column) requires reflectionId, retroPhaseItemId, and a null reflectionGroupId
  // moving a group requires reflectionGroupId & retroPhaseItemId
  if (reflectionId && reflectionGroupId) {
    return addReflectionToGroup(reflectionId, reflectionGroupId, sortOrder, context);
  }
  if (reflectionId && !reflectionGroupId && retroPhaseItemId) {
    return removeReflectionFromGroup(reflectionId, retroPhaseItemId, sortOrder, context);
  }
  if (!reflectionId && reflectionGroupId && retroPhaseItemId) {
    return moveReflectionGroup(reflectionGroupId, retroPhaseItemId, sortOrder, context);
  }
  return undefined;
};

export default handleUpdatedLocation;
