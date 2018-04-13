import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {getUserId, isTeamMember} from 'server/utils/authorization';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';
import {
  sendMeetingMemberNotCheckedInError, sendMeetingMemberNotFoundError,
  sendReflectionGroupNotFoundError
} from 'server/utils/docNotFoundErrors';
import {sendAlreadyCompletedMeetingPhaseError, sendAlreadyEndedMeetingError} from 'server/utils/alreadyMutatedErrors';
import publish from 'server/utils/publish';
import {RETROSPECTIVE, TEAM, VOTE} from 'universal/utils/constants';
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete';
import VoteForReflectionGroupPayload from 'server/graphql/types/VoteForReflectionGroupPayload';
import safelyCastVote from 'server/graphql/mutations/helpers/safelyCastVote';
import safelyWithdrawVote from 'server/graphql/mutations/helpers/safelyWithdrawVote';


export default {
  type: VoteForReflectionGroupPayload,
  description: 'Cast your vote for a reflection group',
  args: {
    isUnvote: {
      type: GraphQLBoolean,
      description: 'true if the user wants to remove one of their votes'
    },
    reflectionGroupId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(source, {isUnvote, reflectionGroupId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {operationId, mutatorId};

    // AUTH
    const viewerId = getUserId(authToken);
    const reflectionGroup = await r.table('RetroReflectionGroup').get(reflectionGroupId);
    if (!reflectionGroup) return sendReflectionGroupNotFoundError(authToken, reflectionGroupId);
    const {meetingId} = reflectionGroup;
    const meeting = await dataLoader.get('newMeetings').load(meetingId);
    const {endedAt, phases, teamId} = meeting;
    if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId);
    if (endedAt) return sendAlreadyEndedMeetingError(authToken, meetingId);
    if (isPhaseComplete(VOTE, phases)) return sendAlreadyCompletedMeetingPhaseError(authToken, VOTE);

    // VALIDATION
    const meetingMember = await r.table('MeetingMember')
      .getAll(meetingId, {index: 'meetingId'})
      .filter({userId: viewerId})
      .nth(0)
      .default(null);
    if (!meetingMember) return sendMeetingMemberNotFoundError(authToken, meetingId);
    const {isCheckedIn} = meetingMember;
    if (!isCheckedIn) return sendMeetingMemberNotCheckedInError(authToken, meetingMember.id);

    // RESOLUTION
    if (isUnvote) {
      const votingError = await safelyWithdrawVote(authToken, meetingId, viewerId, reflectionGroupId);
      if (votingError) return votingError;
    } else {
      const allSettings = await dataLoader.get('meetingSettingsByTeamId').load(teamId);
      const retroSettings = allSettings.find((settings) => settings.meetingType === RETROSPECTIVE);
      const {maxVotesPerGroup} = retroSettings;
      const votingError = await safelyCastVote(authToken, meetingId, viewerId, reflectionGroupId, maxVotesPerGroup);
      if (votingError) return votingError;
    }

    const data = {meetingId, userId: viewerId, reflectionGroupId};
    publish(TEAM, teamId, VoteForReflectionGroupPayload, data, subOptions);
    return data;
  }
};

