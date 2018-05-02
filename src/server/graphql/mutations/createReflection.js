import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {getUserId, isTeamMember} from 'server/utils/authorization';
import shortid from 'shortid';
import {sendPhaseItemNotActiveError, sendTeamAccessError} from 'server/utils/authorizationErrors';
import CreateReflectionPayload from 'server/graphql/types/CreateReflectionPayload';
import {sendMeetingNotFoundError, sendPhaseItemNotFoundError} from 'server/utils/docNotFoundErrors';
import {sendAlreadyCompletedMeetingPhaseError, sendAlreadyEndedMeetingError} from 'server/utils/alreadyMutatedErrors';
import normalizeRawDraftJS from 'universal/validation/normalizeRawDraftJS';
import publish from 'server/utils/publish';
import {GROUP, REFLECT, TEAM} from 'universal/utils/constants';
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete';
import CreateReflectionInput from 'server/graphql/types/CreateReflectionInput';
import unlockAllStagesForPhase from 'server/graphql/mutations/helpers/unlockAllStagesForPhase';

export default {
  type: CreateReflectionPayload,
  description: 'Create a new reflection',
  args: {
    input: {
      type: new GraphQLNonNull(CreateReflectionInput)
    }
  },
  async resolve(source, {input: {content, retroPhaseItemId, sortOrder}}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const now = new Date();
    const subOptions = {operationId, mutatorId};

    // AUTH
    const viewerId = getUserId(authToken);
    const phaseItem = await dataLoader.get('customPhaseItems').load(retroPhaseItemId);
    if (!phaseItem) return sendPhaseItemNotFoundError(authToken, retroPhaseItemId);
    if (!phaseItem.isActive) return sendPhaseItemNotActiveError(authToken, retroPhaseItemId);
    const {teamId} = phaseItem;
    if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId);
    const team = await dataLoader.get('teams').load(teamId);
    const {meetingId} = team;
    const meeting = await r.table('NewMeeting').get(meetingId).default(null);
    if (!meeting) return sendMeetingNotFoundError(authToken, meetingId);
    const {endedAt, phases} = meeting;
    if (endedAt) return sendAlreadyEndedMeetingError(authToken, meetingId);
    if (isPhaseComplete(REFLECT, phases)) return sendAlreadyCompletedMeetingPhaseError(authToken, REFLECT);

    // VALIDATION
    const normalizedContent = normalizeRawDraftJS(content);

    // RESOLUTION
    const reflectionGroupId = shortid.generate();
    const reflection = {
      id: shortid.generate(),
      createdAt: now,
      creatorId: viewerId,
      content: normalizedContent,
      isActive: true,
      meetingId,
      reflectionGroupId,
      retroPhaseItemId,
      sortOrder: 0,
      updatedAt: now
    };

    const reflectionGroup = {
      id: reflectionGroupId,
      createdAt: now,
      isActive: true,
      meetingId,
      retroPhaseItemId,
      sortOrder,
      updatedAt: now,
      voterIds: []
    };
    await r({
      group: r.table('RetroReflectionGroup').insert(reflectionGroup),
      reflection: r.table('RetroReflection').insert(reflection)
    });
    const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId);
    let unlockedStageIds;
    if (reflections.length === 1) {
      unlockedStageIds = unlockAllStagesForPhase(phases, GROUP, true);
      await r.table('NewMeeting').get(meetingId)
        .update({
          phases
        });
    }
    const data = {meetingId, reflectionId: reflection.id, reflectionGroupId, unlockedStageIds};
    publish(TEAM, teamId, CreateReflectionPayload, data, subOptions);
    return data;
  }
};
