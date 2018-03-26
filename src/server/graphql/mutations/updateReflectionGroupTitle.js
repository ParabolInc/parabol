import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {getUserId, isTeamMember} from 'server/utils/authorization';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';
import {sendReflectionGroupNotFoundError} from 'server/utils/docNotFoundErrors';
import {sendAlreadyCompletedMeetingPhaseError, sendAlreadyEndedMeetingError} from 'server/utils/alreadyMutatedErrors';
import publish from 'server/utils/publish';
import {GROUP, TEAM} from 'universal/utils/constants';
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete';
import stringSimilarity from 'string-similarity';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import {sendGroupTitleDuplicateError, sendGroupTitleRequiredError} from 'server/utils/__tests__/validationErrors';
import UpdateReflectionGroupTitlePayload from 'server/graphql/types/UpdateReflectionGroupTitlePayload';

export default {
  type: UpdateReflectionGroupTitlePayload,
  description: 'Update the title of a reflection group',
  args: {
    reflectionGroupId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The new title for the group'
    }
  },
  async resolve(source, {reflectionGroupId, title}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const now = new Date();
    const subOptions = {operationId, mutatorId};

    // AUTH
    const viewerId = getUserId(authToken);
    const reflectionGroup = await r.table('RetroReflectionGroup').get(reflectionGroupId);
    if (!reflectionGroup) return sendReflectionGroupNotFoundError(authToken, reflectionGroupId);
    const {meetingId, smartTitle, title: oldTitle} = reflectionGroup;
    const meeting = await dataLoader.get('newMeetings').load(meetingId);
    const {endedAt, phases, teamId} = meeting;
    if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId);
    if (endedAt) return sendAlreadyEndedMeetingError(authToken, meetingId);
    if (isPhaseComplete(GROUP, phases)) return sendAlreadyCompletedMeetingPhaseError(authToken, GROUP);

    // VALIDATION
    const normalizedTitle = title.trim();
    if (normalizedTitle.length < 1) return sendGroupTitleRequiredError(authToken, reflectionGroupId);
    const allTitles = await r.table('RetroReflectionGroup')
      .getAll(meetingId, {index: 'meetingId'})
      .filter({isActive: true})('title')
      .default([]);
    if (allTitles.includes(normalizedTitle)) return sendGroupTitleDuplicateError(authToken, normalizedTitle);

    // RESOLUTION
    await r.table('RetroReflectionGroup').get(reflectionGroupId)
      .update({
        title: normalizedTitle,
        updatedAt: now
      });

    if (smartTitle && smartTitle === oldTitle) {
      // let's see how smart those smart titles really are. A high similarity means very helpful. Not calling this mutation means perfect!
      const similarity = stringSimilarity.compareTwoStrings(smartTitle, normalizedTitle);
      sendSegmentEvent('Smart group title changed', viewerId, {similarity, smartTitle, title: normalizedTitle});
    }

    const data = {meetingId, reflectionGroupId};
    publish(TEAM, teamId, UpdateReflectionGroupTitlePayload, data, subOptions);
    return data;
  }
};

