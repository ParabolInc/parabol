import {
  ACTION,
  AGENDA_ITEMS,
  CHECKIN,
  DISCUSS,
  FIRST_CALL,
  GROUP,
  LAST_CALL,
  LOBBY,
  RETROSPECTIVE,
  SUMMARY,
  THINK,
  UPDATES,
  VOTE
} from 'universal/utils/constants';
import shortid from 'shortid';

exports.up = async (r) => {
  try {
    await Promise.all([
      r.tableCreate('MeetingSettings')
    ]);
  } catch (e) {
    // noop
  }
  try {
    await Promise.all([
      r.table('MeetingSettings').indexCreate('teamId'),
    ]);
  } catch (e) {
    // noop
  }
  try {
    const teamIds = await r.table('Team')('id');
    const inserts = [];
    teamIds.forEach((teamId) => {
      inserts.push(
        {
          id: shortid.generate(),
          meetingType: RETROSPECTIVE,
          teamId,
          phases: [LOBBY, CHECKIN, THINK, GROUP, VOTE, DISCUSS, SUMMARY],
        },
        {
          id: shortid.generate(),
          meetingType: ACTION,
          teamId,
          phases: [LOBBY, CHECKIN, UPDATES, FIRST_CALL, AGENDA_ITEMS, LAST_CALL, SUMMARY],
        },
      );
    });
    await r.table('MeetingSettings').insert(inserts);
  } catch (e) {
    // noop
  }
};

exports.down = async (r) => {
  try {
    await Promise.all([
      r.tableDrop('MeetingSettings'),
    ]);
  } catch (e) {
    // noop
  }
};
