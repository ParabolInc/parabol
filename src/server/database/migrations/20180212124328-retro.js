import {RETRO_PHASE_ITEM} from 'universal/utils/constants';
import shortid from 'shortid';

exports.up = async (r) => {
  try {
    await Promise.all([
      r.tableCreate('CustomPhaseItem'),
      r.tableCreate('NewMeeting'),
      r.tableCreate('RetroThought'),
      r.tableCreate('RetroThoughtGroup')
    ]);
  } catch (e) {
    // noop
  }
  try {
    await Promise.all([
      r.table('CustomPhaseItem').indexCreate('teamId'),
      r.table('NewMeeting').indexCreate('teamId'),
      r.table('RetroThought').indexCreate('meetingId'),
      r.table('RetroThought').indexCreate('thoughtGroupId'),
      r.table('RetroThoughtGroup').indexCreate('meetingId')
      // r.table('RetroThoughtGroup').indexCreate('teamId'),
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
          type: RETRO_PHASE_ITEM,
          isActive: true,
          teamId,
          title: 'Positive',
          question: 'What’s working?'
        },
        {
          id: shortid.generate(),
          type: RETRO_PHASE_ITEM,
          isActive: true,
          teamId,
          title: 'Negative',
          question: 'Where did you get stuck?'
        },
        {
          id: shortid.generate(),
          type: RETRO_PHASE_ITEM,
          isActive: true,
          teamId,
          title: 'Change',
          question: 'What might we do differently next time?'
        }
      );
    });
    await r.table('CustomPhaseItem').insert(inserts);
  } catch (e) {
    // noop
  }
};

exports.down = async (r) => {
  try {
    await Promise.all([
      r.tableDrop('CustomPhaseItem'),
      r.tableDrop('NewMeeting'),
      r.tableDrop('RetroThought'),
      r.tableDrop('RetroThoughtGroup')
    ]);
  } catch (e) {
    // noop
  }
};
