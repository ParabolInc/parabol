/**
 * Updates a reflection's content for the retrospective meeting.
 *
 * @flow
 */
import {commitMutation} from 'react-relay';
import type {CompletedHandler, ErrorHandler} from 'universal/types/relay';
import updateProxyRecord from 'universal/utils/relay/updateProxyRecord';
import handleAddReflectionGroups from 'universal/mutations/handlers/handleAddReflectionGroups';
import handleRemoveReflectionGroups from 'universal/mutations/handlers/handleRemoveReflectionGroups';
import getInProxy from 'universal/utils/relay/getInProxy';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';
import handleRemoveEmptyReflectionGroup from 'universal/mutations/handlers/handleRemoveEmptyReflectionGroup';
import clientTempId from 'universal/utils/relay/clientTempId';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';
import handleAddReflectionToGroup from 'universal/mutations/handlers/handleAddReflectionToGroup';

type Variables = {
  sortOrder: string,
  reflectionId: string,
  reflectionGroupId?: string,
  retroPhaseItemId?: string
};

graphql`
  fragment UpdateReflectionLocationMutation_team on UpdateReflectionLocationPayload {
    reflection {
      ...CompleteReflectionFrag @relay(mask: false)
    }
    
    reflectionGroup {
      id
      meetingId
      sortOrder
      retroPhaseItemId
      reflections {
        ...CompleteReflectionFrag @relay(mask: false)  
      }
    }
    oldReflectionGroup {
      id
    }
  }
`;

const mutation = graphql`
  mutation UpdateReflectionLocationMutation($reflectionGroupId: ID, $reflectionId: ID, $retroPhaseItemId: ID, $sortOrder: Float!) {
    updateReflectionLocation(
      reflectionGroupId: $reflectionGroupId, reflectionId: $reflectionId, retroPhaseItemId: $retroPhaseItemId, sortOrder: $sortOrder) {
      ...UpdateReflectionLocationMutation_team @relay(mask: false)
    }
  }
`;

const handleRemoveReflectionFromGroup = (reflectionId, reflectionGroupId, store) => {
  const reflectionGroup = store.getLinkedRecord(reflectionGroupId);
  if (!reflectionGroup) return;
  safeRemoveNodeFromArray(reflectionId, reflectionGroup, 'reflections');
};

const moveGroupLocation = (reflectionGroupProxy, store) => {
  const reflectionGroupId = reflectionGroupProxy.getValue('id');
  const meetingId = reflectionGroupProxy.getValue('meetingId');
  handleRemoveReflectionGroups(reflectionGroupId, meetingId, store);
  handleAddReflectionGroups(reflectionGroupProxy, store);
};

const moveReflectionLocation = (reflection, reflectionGroup, oldReflectionGroupId, store) => {
  moveGroupLocation(reflectionGroup, store);
  if (!reflection) return;
  const reflectionId = reflection.getValue('id');
  handleRemoveReflectionFromGroup(reflectionId, oldReflectionGroupId, store);
  handleAddReflectionToGroup(reflection, store);
  handleRemoveEmptyReflectionGroup(oldReflectionGroupId, store);
};

export const updateReflectionLocationTeamUpdater = (payload, store) => {
  const reflection = payload.getLinkedRecord('reflection');
  const reflectionGroup = payload.getLinkedRecord('reflectionGroup');
  const oldReflectionGroupId = getInProxy(payload, 'oldReflectionGroup', 'id');
  moveReflectionLocation(reflection, reflectionGroup, oldReflectionGroupId, store);
};

const UpdateReflectionLocationMutation = (
  environment: Object,
  variables: Variables,
  onError?: ErrorHandler,
  onCompleted?: CompletedHandler
) => {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('updateReflectionLocation');
      if (!payload) return;
      updateReflectionLocationTeamUpdater(payload, store);
    },
    optimisticUpdater: (store) => {
      const nowISO = new Date().toJSON();
      const {reflectionId, reflectionGroupId, retroPhaseItemId, sortOrder} = variables;

      // move an entire group somewhere else
      if (!reflectionId) {
        const reflectionGroupProxy = store.get(reflectionGroupId);
        updateProxyRecord(reflectionGroupProxy, {sortOrder});
        moveGroupLocation(reflectionGroupProxy, store);
        return;
      }

      const reflectionProxy = store.get(reflectionId);
      const oldReflectionGroupId = reflectionProxy.getValue('reflectionGroupId');
      const oldReflectionGroupProxy = store.get(oldReflectionGroupId);
      const meetingId = oldReflectionGroupProxy.getValue('meetingId');
      const meeting = store.get(meetingId);
      let reflectionGroupProxy;
      // move a reflection into its own group
      if (reflectionGroupId === null) {
        updateProxyRecord(reflectionProxy, {sortOrder: 0, retroPhaseItemId});
        // create the new group
        const reflectionGroup = {
          id: clientTempId(),
          createdAt: nowISO,
          isActive: true,
          meetingId,
          retroPhaseItemId,
          sortOrder,
          updatedAt: nowISO,
          voterIds: []
        };
        reflectionGroupProxy = createProxyRecord(store, 'RetroReflectionGroup', reflectionGroup);
        reflectionGroupProxy.setLinkedRecords([reflectionProxy], 'reflections');
        reflectionGroupProxy.setLinkedRecord(meeting, 'meeting');
        // handleAddReflectionGroups(reflectionGroupProxy, store);
        // handleRemoveReflectionFromGroup(reflectionId, oldReflectionGroupId, store);
      } else if (reflectionGroupId === oldReflectionGroupId) {
        // move a card within the same group
        updateProxyRecord(reflectionProxy, {sortOrder});
        // handleRemoveReflectionFromGroup(reflectionId, oldReflectionGroupId, store);
        // handleAddReflectionToGroup(reflectionProxy, store);
      } else {
        // move a card into another group
        updateProxyRecord(reflectionProxy, {sortOrder, reflectionGroupId, retroPhaseItemId});
        reflectionGroupProxy = store.get(reflectionGroupId);
        const phaseItemProxy = store.get(retroPhaseItemId);
        reflectionProxy.setLinkedRecord(phaseItemProxy, 'phaseItem');
        reflectionProxy.setLinkedRecord(reflectionGroupProxy, 'retroReflectionGroup');
        // handleRemoveReflectionFromGroup(reflectionId, oldReflectionGroupId, store);
        // handleRemoveEmptyReflectionGroup(oldReflectionGroupId, store);
        // handleAddReflectionToGroup(reflectionProxy, store);
      }
      moveReflectionLocation(reflectionProxy, reflectionGroupProxy, oldReflectionGroupId, store);
    }
  });
};

export default UpdateReflectionLocationMutation;
