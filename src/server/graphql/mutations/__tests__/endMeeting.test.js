import getRethink from 'server/database/rethinkDriver';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDate from 'mockdate';
import {__anHourAgo, __now} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import DynamicSerializer from 'dynamic-serializer';
import MockDB from 'server/__tests__/setup/MockDB';
import expectAsyncToThrow from 'server/__tests__/utils/expectAsyncToThrow';
import socket from 'server/__mocks__/socket';
import * as sendEmailPromise from 'server/email/sendEmail';
import endMeeting from 'server/graphql/mutations/endMeeting';
import makeDataLoader from 'server/__tests__/setup/makeDataLoader';

MockDate.set(__now);
console.error = jest.fn();

describe('endMeeting', () => {
  test('generates a meeting summary and sets sort order', async () => {
    // SETUP
    sendEmailPromise.default = jest.fn(() => true);
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {teamMember, user} = await mockDB.init()
      .newMeeting({createdAt: new Date(__anHourAgo - 10000)}, {inProgress: true});
    const authToken = mockAuthToken(user[0]);
    const meetingId = mockDB.context.meeting.id;
    const teamId = mockDB.context.team.id;
    const teamMemberIds = teamMember.filter((tm) => tm.teamId === teamId).map(({id}) => id);
    const dataLoader = makeDataLoader(authToken);

    // TEST
    await endMeeting.resolve(undefined, {teamId}, {authToken, dataLoader, socket});
    // VERIFY
    const db = await fetchAndSerialize({
      agendaItem: r.table('AgendaItem').getAll(teamId, {index: 'teamId'}).orderBy('teamMemberId'),
      task: r.table('Task').getAll(r.args(teamMemberIds), {index: 'assigneeId'}).orderBy('content'),
      meeting: r.table('Meeting').get(meetingId),
      team: r.table('Team').get(teamId),
      teamMember: r.table('TeamMember').getAll(teamId, {index: 'teamId'}).orderBy('preferredName')
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(dataLoader.isShared()).toEqual(true);
  });

  test('generates a meeting summary and sets sort order with pre-existing actions and tasks', async () => {
    // SETUP
    sendEmailPromise.default = jest.fn(() => true);
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {teamMember, user} = await mockDB.init()
      .newTask()
      .newMeeting({createdAt: new Date(__anHourAgo - 10000)}, {inProgress: true});
    const authToken = mockAuthToken(user[0]);
    const meetingId = mockDB.context.meeting.id;
    const teamId = mockDB.context.team.id;
    const teamMemberIds = teamMember.filter((tm) => tm.teamId === teamId).map(({id}) => id);
    const dataLoader = makeDataLoader(authToken);

    // TEST
    await endMeeting.resolve(undefined, {teamId}, {authToken, dataLoader, socket});
    // VERIFY
    const db = await fetchAndSerialize({
      agendaItem: r.table('AgendaItem').getAll(teamId, {index: 'teamId'}).orderBy('content'),
      task: r.table('Task').getAll(r.args(teamMemberIds), {index: 'assigneeId'}).orderBy('content'),
      meeting: r.table('Meeting').get(meetingId),
      team: r.table('Team').get(teamId),
      teamMember: r.table('TeamMember').getAll(teamId, {index: 'teamId'}).orderBy('preferredName')
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(dataLoader.isShared()).toEqual(true);
  });

  test('throw if called after meeting ended or no active meeting', async () => {
    // SETUP
    const mockDB = new MockDB();
    const {user} = await mockDB.init()
      .newMeeting();
    const authToken = mockAuthToken(user[0]);
    const teamId = mockDB.context.team.id;
    const dataLoader = makeDataLoader(authToken);

    // TEST
    await expectAsyncToThrow(endMeeting.resolve(undefined, {teamId}, {authToken, dataLoader, socket}));
  });

  test('throw if no meeting has ever been created', async () => {
    // SETUP
    const mockDB = new MockDB();
    const {user} = await mockDB.init();
    const authToken = mockAuthToken(user[0]);
    const teamId = mockDB.context.team.id;
    const dataLoader = makeDataLoader(authToken);

    // TEST
    await expectAsyncToThrow(endMeeting.resolve(undefined, {teamId}, {authToken, dataLoader, socket}));
  });

  test('throw when the caller is not a team member', async () => {
    // SETUP
    const mockDB = new MockDB();
    const {user} = await mockDB.init();
    const authToken = mockAuthToken(user[1]);
    const dataLoader = makeDataLoader(authToken);

    // TEST
    await expectAsyncToThrow(endMeeting.resolve(undefined, {teamId: 'foo'}, {authToken, dataLoader, socket}));
  });
});
