import {GraphQLFloat, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {isTeamMember} from 'server/utils/authorization';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';
import {sendMeetingNotFoundError} from 'server/utils/docNotFoundErrors';
import {sendAlreadyCompletedMeetingPhaseError, sendAlreadyEndedMeetingError} from 'server/utils/alreadyMutatedErrors';
import publish from 'server/utils/publish';
import {GROUP, TEAM} from 'universal/utils/constants';
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete';
import AutoGroupReflectionsPayload from 'server/graphql/types/AutoGroupReflectionsPayload';
import {sendGroupingThresholdValidationError} from 'server/utils/__tests__/validationErrors';
import groupReflections from 'server/graphql/mutations/helpers/groupReflections';

export default {
  type: AutoGroupReflectionsPayload,
  description: 'Automatically group reflections',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    groupingThreshold: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'A number from 0 to 1 to determine how tightly to pack the groups. Higher means fewer groups'
    }
  },
  async resolve(source, {meetingId, groupingThreshold}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const now = new Date();
    const subOptions = {operationId, mutatorId};

    // AUTH
    const meeting = await r.table('NewMeeting').get(meetingId).default(null);
    if (!meeting) return sendMeetingNotFoundError(authToken, meetingId);
    const {endedAt, phases, teamId} = meeting;
    if (endedAt) return sendAlreadyEndedMeetingError(authToken, meetingId);
    if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId);
    if (isPhaseComplete(GROUP, phases)) return sendAlreadyCompletedMeetingPhaseError(authToken, GROUP);


    // VALIDATION
    if (groupingThreshold < 0.01 || groupingThreshold > 0.99) {
      return sendGroupingThresholdValidationError(authToken, meetingId, groupingThreshold);
    }

    // RESOLUTION
    const {groupedReflections, groups} = await groupReflections(meetingId, groupingThreshold);
    // const reflectionGroup = {
    //   id: reflectionGroupId,
    //   createdAt: now,
    //   isActive: true,
    //   meetingId,
    //   smartTitle,
    //   title,
    //   updatedAt: now,
    //   voterIds: [],
    //   sortOrder: reflections[0].sortOrder
    // };


    await r({
      groups: r.table('RetroReflectionGroup').insert(groups),
      reflections: r(groupedReflections).forEach((reflection) => {
        return r.table('RetroReflection')
          .get(reflection('id'))
          .update({
            reflectionGroupId: reflection('reflectionGroupId'),
            sortOrder: reflection('sortOrder'),
            updatedAt: now
          });
      })
    });

    const reflectionGroupIds = groups.map(({id}) => id);
    const reflectionIds = groupedReflections.map(({id}) => id);
    const data = {meetingId, reflectionGroupIds, reflectionIds};
    publish(TEAM, teamId, AutoGroupReflectionsPayload, data, subOptions);
    return data;
  }
};
