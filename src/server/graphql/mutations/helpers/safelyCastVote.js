import {sendMaxVotesPerGroupError, sendNoVotesLeftError} from 'server/utils/alreadyMutatedErrors';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';
import getRethink from 'server/database/rethinkDriver';

const safelyCastVote = async (authToken, meetingId, userId, reflectionGroupId, maxVotesPerGroup) => {
  const meetingMemberId = toTeamMemberId(meetingId, userId);
  const r = getRethink();
  const now = new Date();

  const isVoteRemovedFromUser = await r.table('MeetingMember')
    .get(meetingMemberId)
    .update((member) => {
      // go atomic. no cheating allowed
      return r.branch(
        member('votesRemaining').ge(1),
        {
          updatedAt: now,
          votesRemaining: member('votesRemaining').sub(1)
        },
        {}
      );
    })('replaced')
    .eq(1);
  if (!isVoteRemovedFromUser) return sendNoVotesLeftError(authToken, reflectionGroupId, maxVotesPerGroup);
  const isVoteAddedToGroup = await r.table('RetroReflectionGroup')
    .get(reflectionGroupId)
    .update((group) => {
      return r.branch(
        group('voterIds').count(userId).lt(maxVotesPerGroup),
        {
          updatedAt: now,
          voterIds: group('voterIds').append(userId)
        },
        {}
      );
    })('replaced')
    .eq(1);
  if (!isVoteAddedToGroup) {
    await r.table('MeetingMember')
      .get(meetingMemberId)
      .update((member) => ({
        votesRemaining: member('votesRemaining').add(1)
      }));
    return sendMaxVotesPerGroupError(authToken, reflectionGroupId, maxVotesPerGroup);
  }
  return undefined;
};

export default safelyCastVote;
