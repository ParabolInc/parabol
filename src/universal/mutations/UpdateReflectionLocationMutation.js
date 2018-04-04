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
  const reflectionGroup = store.get(reflectionGroupId);
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

type Context = {
  meetingId: string
};

const UpdateReflectionLocationMutation = (
  environment: Object,
  variables: Variables,
  context: Context,
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

      // only do this for the mutator, don't want unexpected collapses because someone else did something
      const reflectionGroupId = getInProxy(payload, 'reflectionGroup', 'id');
      const oldReflectionGroupId = getInProxy(payload, 'oldReflectionGroup', 'id');
      if (reflectionGroupId) {
        store.get(reflectionGroupId).setValue(false, 'isExpanded');
      }
      if (oldReflectionGroupId) {
        store.get(oldReflectionGroupId).setValue(false, 'isExpanded');
      }

    },
    optimisticUpdater: (store) => {
      const nowISO = new Date().toJSON();
      const {reflectionId, reflectionGroupId, retroPhaseItemId, sortOrder} = variables;
      const {meetingId} = context;
      // move an entire group somewhere else
      if (!reflectionId) {
        const reflectionGroupProxy = store.get(reflectionGroupId);
        updateProxyRecord(reflectionGroupProxy, {sortOrder});
        moveGroupLocation(reflectionGroupProxy, store);
        return;
      }

      const reflectionProxy = store.get(reflectionId);
      const oldReflectionGroupId = reflectionProxy.getValue('reflectionGroupId');
      const meeting = store.get(meetingId);
      let reflectionGroupProxy = store.get(reflectionGroupId);
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
      } else if (reflectionGroupId === oldReflectionGroupId) {
        // move a card within the same group
        updateProxyRecord(reflectionProxy, {sortOrder});
      } else {
        // move a card into another group
        const groupRetroPhaseItemId = reflectionGroupProxy.getValue('retroPhaseItemId');
        updateProxyRecord(reflectionProxy, {sortOrder, reflectionGroupId, retroPhaseItemId: groupRetroPhaseItemId});
        const phaseItemProxy = store.get(groupRetroPhaseItemId);
        reflectionProxy.setLinkedRecord(phaseItemProxy, 'phaseItem');
        reflectionProxy.setLinkedRecord(reflectionGroupProxy, 'retroReflectionGroup');
      }
      moveReflectionLocation(reflectionProxy, reflectionGroupProxy, oldReflectionGroupId, store);
    }
  });
};

export default UpdateReflectionLocationMutation;
