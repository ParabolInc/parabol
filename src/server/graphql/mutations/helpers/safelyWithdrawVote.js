import {sendAlreadyRemovedVoteError} from 'server/utils/alreadyMutatedErrors';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';
import getRethink from 'server/database/rethinkDriver';

const safelyWithdrawVote = async (authToken, meetingId, userId, reflectionGroupId) => {
  const meetingMemberId = toTeamMemberId(meetingId, userId);
  const r = getRethink();
  const now = new Date();

  const isVoteRemovedFromGroup = await r
    .table('RetroReflectionGroup')
    .get(reflectionGroupId)
    .update((group) => {
      return r.branch(
        group('voterIds')
          .offsetsOf(userId)
          .count()
          .ge(1),
        {
          updatedAt: now,
          voterIds: group('voterIds').deleteAt(
            group('voterIds')
              .offsetsOf(userId)
              .nth(0)
          )
        },
        {}
      );
    })('replaced')
    .eq(1);
  if (!isVoteRemovedFromGroup) {
    return sendAlreadyRemovedVoteError(authToken, reflectionGroupId);
  }
  await r
    .table('MeetingMember')
    .get(meetingMemberId)
    .update((member) => ({
      updatedAt: now,
      votesRemaining: member('votesRemaining').add(1)
    }));
  return undefined;
};

export default safelyWithdrawVote;
