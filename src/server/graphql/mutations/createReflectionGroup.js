import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {isTeamMember} from 'server/utils/authorization';
import shortid from 'shortid';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';
import {sendMeetingNotFoundError, sendReflectionNotFoundError} from 'server/utils/docNotFoundErrors';
import {sendAlreadyCompletedMeetingPhaseError, sendAlreadyEndedMeetingError} from 'server/utils/alreadyMutatedErrors';
import publish from 'server/utils/publish';
import {GROUP, TEAM} from 'universal/utils/constants';
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete';
import CreateReflectionGroupPayload from 'server/graphql/types/CreateReflectionGroupPayload';
import makeRetroGroupTitle from 'server/graphql/mutations/helpers/makeRetroGroupTitle';

export default {
  type: CreateReflectionGroupPayload,
  description: 'Create a new reflection group',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    reflectionIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'An array of 1 or more reflections that make up the group. The first card in the array will be used to determine sort order'
    }
  },
  async resolve(source, {meetingId, reflectionIds}, {authToken, dataLoader, socketId: mutatorId}) {
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
    const reflections = await dataLoader.get('retroReflections').loadMany(reflectionIds);
    if (reflections.some((reflection) => !reflection)) return sendReflectionNotFoundError(authToken, reflectionIds);

    // RESOLUTION
    const reflectionGroupId = shortid.generate();
    const reflectionGroup = {
      id: reflectionGroupId,
      createdAt: now,
      isActive: true,
      meetingId,
      title: makeRetroGroupTitle(meetingId, reflections),
      updatedAt: now,
      voterIds: [],
      sortOrder: reflections[0].sortOrder
    };

    const groupSortOrders = reflectionIds.reduce((obj, id, idx) => {
      obj[id] = idx;
      return obj;
    }, {});

    await r({
      group: r.table('RetroReflectionGroup').insert(reflectionGroup),
      reflections: r.table('RetroReflection')
        .getAll(r.args(reflectionIds), {index: 'id'})
        .update((reflection) => ({
          reflectionGroupId,
          groupSortOrder: r(groupSortOrders)(reflection('id'))
        }))
    });

    const data = {meetingId, reflectionGroupId};
    publish(TEAM, teamId, CreateReflectionGroupPayload, data, subOptions);
    return data;
  }
};
