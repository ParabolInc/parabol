import {PRO, RETROSPECTIVE_TRIAL_COUNT_DEFAULT} from 'universal/utils/constants';

exports.up = async (r) => {
  try {
    await r.table('Organization')
      .update((org) => {
        return r.branch(
          org('tier').eq(PRO),
          {
            retroMeetingsOffered: 0,
            retroMeetingsRemaining: 0
          },
          {
            retroMeetingsOffered: RETROSPECTIVE_TRIAL_COUNT_DEFAULT,
            retroMeetingsRemaining: RETROSPECTIVE_TRIAL_COUNT_DEFAULT
          }
        );
      });
  } catch (e) {
    // noop
  }
};

exports.down = async (r) => {
  try {
    await r.table('Organization')
      .replace((org) => org.without('retroMeetingsOffered', 'retroMeetingsRemaining'));
  } catch (e) {
    // noop
  }
};
