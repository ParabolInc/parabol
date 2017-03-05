import getRethink from 'server/database/rethinkDriver';
import MockDate from 'mockdate';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndTrim from 'server/__tests__/utils/fetchAndTrim';
import TrimSnapshot from 'server/__tests__/utils/TrimSnapshot';
import MockDB from 'server/__tests__/setup/MockDB';
import resetMeeting from 'server/graphql/models/Team/endMeeting/resetMeeting';

MockDate.set(__now);
console.error = jest.fn();

describe('resetMeeting', () => {
  test('resets the meeting state back to the lobby after the meeting ended', async() => {
    // SETUP
    const r = getRethink();
    const trimSnapshot = new TrimSnapshot();
    const mockDB = new MockDB();
    const {teamMember} = await mockDB.init()
      .newMeeting(undefined, {inProgress: true});
    const teamId = mockDB.context.team.id;
    const teamMemberIds = teamMember.filter((tm) => tm.teamId === teamId).map(({id}) => id);

    // TEST
    jest.useFakeTimers();
    const promise = resetMeeting(teamId);
    jest.runTimersToTime(5000);
    await promise;
    // VERIFY
    const db = await fetchAndTrim({
      agendaItem: r.table('AgendaItem').getAll(teamId, {index: 'teamId'}).orderBy('teamMemberId'),
      project: r.table('Project').getAll(r.args(teamMemberIds), {index: 'teamMemberId'}).orderBy('teamMemberId'),
      team: r.table('Team').get(teamId),
      teamMember: r.table('TeamMember').getAll(teamId, {index: 'teamId'}).orderBy('preferredName'),

    }, trimSnapshot);
    expect(db).toMatchSnapshot();
  });
});
