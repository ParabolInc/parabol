import {ContentState} from 'draft-js';

exports.up = async (r) => {
  const teamsWithActiveMeetings = await r.table('Team')
    .filter((team) => team('checkInQuestion').default(null).ne(null))
    .pluck('id', 'checkInQuestion');
  await Promise.all(teamsWithActiveMeetings.map((team) => {
    const checkInQuestion = ContentState.createFromText(team.checkInQuestion);
    return r.table('Team').get(team.id).update({checkInQuestion});
  }));
};

exports.down = async () => {
  // noop
};
