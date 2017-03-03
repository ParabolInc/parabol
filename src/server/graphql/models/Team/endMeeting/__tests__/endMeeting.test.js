import getRethink from 'server/database/rethinkDriver';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDate from 'mockdate';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndTrim from 'server/__tests__/utils/fetchAndTrim';
import TrimSnapshot from 'server/__tests__/utils/TrimSnapshot';
import MockDB from 'server/__tests__/setup/MockDB';
import expectAsyncToThrow from 'server/__tests__/utils/expectAsyncToThrow';
import socket from 'server/__mocks__/socket';
import endMeeting from 'server/graphql/models/Team/endMeeting/endMeeting';

MockDate.set(__now);
console.error = jest.fn();

describe('endMeeting', () => {
  test('generates a meeting summary and sets sort order', async() => {
    // SETUP
    const r = getRethink();
    const trimSnapshot = new TrimSnapshot();
    const mockDB = new MockDB();
    const {teamMember, user} = await mockDB.init()
      .newMeeting(undefined, {inProgress: true});
    const authToken = mockAuthToken(user[0]);
    const meetingId = mockDB.context.meeting.id;
    const teamId = mockDB.context.team.id;
    const teamMemberIds = teamMember.filter((tm) => tm.teamId === teamId).map(({id}) => id);
    // TEST
    await endMeeting.resolve(undefined, {teamId}, {authToken, socket});

    // VERIFY
    const db = await fetchAndTrim({
      action: r.table('Action').getAll(r.args(teamMemberIds), {index: 'teamMemberId'}).orderBy('teamMemberId'),
      project: r.table('Project').getAll(r.args(teamMemberIds), {index: 'teamMemberId'}).orderBy('teamMemberId'),
      meeting: r.table('Meeting').get(meetingId),
      team: r.table('Team').get(teamId),

    }, trimSnapshot);
    expect(db).toMatchSnapshot();
    await new Promise(res => setTimeout(() => res(), 100));
  });
  //
  // test('updates the content of the action', async() => {
  //   // SETUP
  //   const r = getRethink();
  //   const trimSnapshot = new TrimSnapshot();
  //   const mockDB = new MockDB();
  //   const {action, user} = await mockDB.init()
  //     .newAction();
  //   const actionId = action[0].id;
  //   const authToken = mockAuthToken(user[7]);
  //
  //   // TEST
  //   const updatedAction = {
  //     id: actionId,
  //     content: 'Updated content'
  //   };
  //   await endMeeting.resolve(undefined, {updatedAction}, {authToken, socket});
  //
  //   // VERIFY
  //   const db = await fetchAndTrim({
  //     action: r.table('Action').get(actionId),
  //   }, trimSnapshot);
  //   expect(db).toMatchSnapshot();
  // });
  //
  // test('updates the status of the action', async() => {
  //   // SETUP
  //   const r = getRethink();
  //   const trimSnapshot = new TrimSnapshot();
  //   const mockDB = new MockDB();
  //   const {action, user} = await mockDB.init()
  //     .newAction();
  //   const actionId = action[0].id;
  //   const authToken = mockAuthToken(user[7]);
  //
  //   // TEST
  //   const updatedAction = {
  //     id: actionId,
  //     isComplete: true
  //   };
  //   await endMeeting.resolve(undefined, {updatedAction}, {authToken, socket});
  //
  //   // VERIFY
  //   const db = await fetchAndTrim({
  //     action: r.table('Action').get(actionId),
  //   }, trimSnapshot);
  //   expect(db).toMatchSnapshot();
  // });

  test('throws when no websocket is present', async() => {
    const authToken = {};
    await expectAsyncToThrow(endMeeting.resolve(undefined, {teamId: 'foo'}, {authToken}));
  });

  test('throw when the caller is not a team member', async() => {
    // SETUP
    const mockDB = new MockDB();
    const {user} = await mockDB.init();
    const authToken = mockAuthToken(user[1]);

    // TEST
    await expectAsyncToThrow(endMeeting.resolve(undefined, {teamId: 'foo'}, {authToken, socket}));
  });
});
