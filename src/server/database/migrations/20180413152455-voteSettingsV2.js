import {
  RETROSPECTIVE,
  RETROSPECTIVE_MAX_VOTES_PER_GROUP_DEFAULT,
  RETROSPECTIVE_TOTAL_VOTES_DEFAULT
} from 'universal/utils/constants';

// the first voteSettings did not take (possible merge conflict?) trying again
exports.up = async (r) => {
  try {
    await r.tableCreate('MeetingMember');
  } catch (e) {
    // noop
  }
  try {
    await Promise.all([
      r.table('MeetingMember').indexCreate('meetingId'),
      r.table('MeetingMember').indexCreate('teamId'),
      r.table('MeetingMember').indexCreate('userId')
    ]);
  } catch (e) {
    // noop
  }
  try {
    await r
      .table('MeetingSettings')
      .filter({meetingType: RETROSPECTIVE})
      .update({
        totalVotes: RETROSPECTIVE_TOTAL_VOTES_DEFAULT,
        maxVotesPerGroup: RETROSPECTIVE_MAX_VOTES_PER_GROUP_DEFAULT
      });
  } catch (e) {
    // noop
  }
};

exports.down = async (r) => {
  try {
    await r
      .table('MeetingSettings')
      .filter({meetingType: RETROSPECTIVE})
      .replace((settings) => settings.without('totalVotes', 'maxVotesPerGroup'));
  } catch (e) {
    // noop
  }
  try {
    await r.tableDrop('MeetingMember');
  } catch (e) {
    // noop
  }
};
