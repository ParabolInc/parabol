import {GraphQLFloat, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {getUserId, isTeamMember} from 'server/utils/authorization';
import shortid from 'shortid';
import {sendPhaseItemNotActiveError, sendTeamAccessError} from 'server/utils/authorizationErrors';
import CreateReflectionPayload from 'server/graphql/types/CreateReflectionPayload';
import {sendMeetingNotFoundError, sendPhaseItemNotFoundError} from 'server/utils/docNotFoundErrors';
import {sendAlreadyCompletedMeetingPhaseError, sendAlreadyEndedMeetingError} from 'server/utils/alreadyMutatedErrors';
import normalizeRawDraftJS from 'universal/validation/normalizeRawDraftJS';
import publish from 'server/utils/publish';
import {REFLECT, TEAM} from 'universal/utils/constants';
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete';

export default {
  type: CreateReflectionPayload,
  description: 'Create a new reflection',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    content: {
      type: GraphQLString,
      description: 'A stringified draft-js document containing thoughts'
    },
    retroPhaseItemId: {
      type: GraphQLID,
      description: 'The phase item the reflection belongs to'
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat)
    }
  },
  async resolve(source, {meetingId, content, retroPhaseItemId, sortOrder}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const now = new Date();
    const subOptions = {operationId, mutatorId};

    // AUTH
    const viewerId = getUserId(authToken);
    const meeting = await r.table('NewMeeting').get(meetingId).default(null);
    if (!meeting) return sendMeetingNotFoundError(authToken, meetingId);
    const {endedAt, phases, teamId} = meeting;
    if (endedAt) return sendAlreadyEndedMeetingError(authToken, meetingId);
    if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId);
    if (isPhaseComplete(REFLECT, phases)) return sendAlreadyCompletedMeetingPhaseError(authToken, REFLECT);

    // VALIDATION
    const phaseItem = await dataLoader.get('customPhaseItems').load(retroPhaseItemId);
    if (!phaseItem || phaseItem.teamId !== teamId) return sendPhaseItemNotFoundError(authToken, retroPhaseItemId);
    if (!phaseItem.isActive) return sendPhaseItemNotActiveError(authToken, retroPhaseItemId);
    const normalizedContent = normalizeRawDraftJS(content);

    // RESOLUTION
    const reflection = {
      id: shortid.generate(),
      createdAt: now,
      creatorId: viewerId,
      content: normalizedContent,
      isActive: true,
      meetingId,
      retroPhaseItemId,
      sortOrder,
      updatedAt: now
    };
    await r.table('RetroReflection').insert(reflection);
    const data = {meetingId, reflectionId: reflection.id};
    publish(TEAM, teamId, CreateReflectionPayload, data, subOptions);
    return data;
  }
};
