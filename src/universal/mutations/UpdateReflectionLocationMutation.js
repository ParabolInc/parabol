/**
 * Updates a reflection's content for the retrospective meeting.
 *
 * @flow
 */
import {commitMutation} from 'react-relay';
import type {CompletedHandler, ErrorHandler} from 'universal/types/relay';
import updateProxyRecord from 'universal/utils/relay/updateProxyRecord';
import handleCreateReflections from 'universal/mutations/handlers/handleCreateReflections';
import handleRemoveReflectionGroups from 'universal/mutations/handlers/handleRemoveReflectionGroups';
import getInProxy from 'universal/utils/relay/getInProxy';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';
import addNodeToArray from 'universal/utils/relay/addNodeToArray';
import {createReflectionTeamUpdater} from 'universal/mutations/CreateReflectionMutation';
import handleRemoveEmptyReflectionGroup from 'universal/mutations/handlers/handleRemoveEmptyReflectionGroup';
import clientTempId from 'universal/utils/relay/clientTempId';
import * as shortid from 'shortid';

type Variables = {
  sortOrder: string,
  reflectionId: string,
  reflectionGroupId?: string,
  retroPhaseItemId?: string
};

graphql`
  fragment UpdateReflectionLocationMutation_team on UpdateReflectionLocationPayload {
    meeting {
      id
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
      reflections {
        ...CompleteReflectionFrag @relay(mask: false)
      }
    }
  }
`;

const mutation = graphql`
  mutation UpdateReflectionLocationMutation($reflectionGroupId: ID, $reflectionId: ID!, $retroPhaseItemId: ID, $sortOrder: Float!) {
    updateReflectionLocation(reflectionGroupId: $reflectionGroupId, reflectionId: $reflectionId, retroPhaseItemId: $retroPhaseItemId, sortOrder: $sortOrder) {
      ...UpdateReflectionLocationMutation_team @relay(mask: false)
    }
  }
`;

const handleRemoveReflectionFromGroup = (reflectionId, reflectionGroupId, store) => {
  const reflectionGroup = store.getLinkedRecord(reflectionGroupId);
  if (!reflectionGroup) return;
  safeRemoveNodeFromArray(reflectionId, reflectionGroup, 'reflections');
};

const handleAddReflectionGroupToMeeting = (reflectionId, store) => {
  reflectionGroup
  const teamId = newNode.getValue('teamId');
  const team = store.get(teamId);
  addNodeToArray(newNode, team, 'agendaItems', 'sortOrder');
}

export const updateReflectionLocationTeamUpdater = (payload, store) => {
  const reflectionGroup = payload.getLinkedRecord('reflectionGroup');
  handleCreateReflections(reflectionGroup, store);
  const reflectionGroupId = getInProxy(payload, 'reflectionGroup', 'id');
  handleRemoveEmptyReflectionGroup(reflectionGroupId, store);
};

const CreateReflectionMutation = (
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
      const reflectionProxy = store.get(reflectionId);
      // a reflection was moved from a group of 1 to a another group
      // a reflection was moved from a group of > 1 to another group of >= 1
      // a reflection was moved from a group of > 1 to its own group
      // a reflection was moved
      const oldReflectionGroupId = reflectionProxy.getValue('reflectionGroupId');
      // const oldReflectionGroup =
      const nextReflectionGroupId = reflectionGroupId || clientTempId();
      const reflectionSortOrder = nextReflectionGroupId === reflectionGroupId ? sortOrder : 0;
      if (reflectionGroupId === null) {
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
      }
      const nowISO = new Date().toJSON();
      const optimisticReflection = {
        content,
        updatedAt: nowISO
      };
      updateProxyRecord(reflectionProxy, optimisticReflection);
    }
  });
};

export default CreateReflectionMutation;
