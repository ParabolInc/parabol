import getRethink from 'server/database/rethinkDriver';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDate from 'mockdate';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import DynamicSerializer from 'dynamic-serializer';
import MockDB from 'server/__tests__/setup/MockDB';
import expectAsyncToThrow from 'server/__tests__/utils/expectAsyncToThrow';
import socket from 'server/__mocks__/socket';
import endMeeting from 'server/graphql/models/Team/endMeeting/endMeeting';
import * as resetMeeting from 'server/graphql/models/Team/endMeeting/resetMeeting';

MockDate.set(__now);
console.error = jest.fn();

describe('endMeeting', () => {
  test('generates a meeting summary and sets sort order', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {teamMember, user} = await mockDB.init()
      .newMeeting(undefined, {inProgress: true});
    const authToken = mockAuthToken(user[0]);
    const meetingId = mockDB.context.meeting.id;
    const teamId = mockDB.context.team.id;
    const teamMemberIds = teamMember.filter((tm) => tm.teamId === teamId).map(({id}) => id);
    const mockFn = resetMeeting.default = jest.fn();
    //
    // TEST
    await endMeeting.resolve(undefined, {teamId}, {authToken, socket});
    // VERIFY
    const db = await fetchAndSerialize({
      agendaItem: r.table('AgendaItem').getAll(teamId, {index: 'teamId'}).orderBy('teamMemberId'),
      action: r.table('Action').getAll(r.args(teamMemberIds), {index: 'teamMemberId'}).orderBy('teamMemberId'),
      project: r.table('Project').getAll(r.args(teamMemberIds), {index: 'teamMemberId'}).orderBy('teamMemberId'),
      meeting: r.table('Meeting').get(meetingId),
      team: r.table('Team').get(teamId),
      teamMember: r.table('TeamMember').getAll(teamId, {index: 'teamId'}).orderBy('preferredName'),
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(mockFn).toBeCalledWith(teamId);
  });

  test('generates a meeting summary and sets sort order with pre-existing actions and projects', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {teamMember, user} = await mockDB.init()
      .newAction()
      .newProject()
      .newMeeting(undefined, {inProgress: true});
    const authToken = mockAuthToken(user[0]);
    const meetingId = mockDB.context.meeting.id;
    const teamId = mockDB.context.team.id;
    const teamMemberIds = teamMember.filter((tm) => tm.teamId === teamId).map(({id}) => id);
    const mockFn = resetMeeting.default = jest.fn();
    //
    // TEST
    await endMeeting.resolve(undefined, {teamId}, {authToken, socket});
    // VERIFY
    const db = await fetchAndSerialize({
      agendaItem: r.table('AgendaItem').getAll(teamId, {index: 'teamId'}).orderBy('content'),
      action: r.table('Action').getAll(r.args(teamMemberIds), {index: 'teamMemberId'}).orderBy('content'),
      project: r.table('Project').getAll(r.args(teamMemberIds), {index: 'teamMemberId'}).orderBy('content'),
      meeting: r.table('Meeting').get(meetingId),
      team: r.table('Team').get(teamId),
      teamMember: r.table('TeamMember').getAll(teamId, {index: 'teamId'}).orderBy('preferredName'),
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(mockFn).toBeCalledWith(teamId);
  });

  test('throw if called after meeting ended or no active meeting', async () => {
    // SETUP
    const mockDB = new MockDB();
    const {user} = await mockDB.init()
      .newMeeting();
    const authToken = mockAuthToken(user[0]);
    const teamId = mockDB.context.team.id;

    // TEST
    await expectAsyncToThrow(endMeeting.resolve(undefined, {teamId}, {authToken, socket}));
  });

  test('throw if no meeting has ever been created', async () => {
    // SETUP
    const mockDB = new MockDB();
    const {user} = await mockDB.init();
    const authToken = mockAuthToken(user[0]);
    const teamId = mockDB.context.team.id;

    // TEST
    await expectAsyncToThrow(endMeeting.resolve(undefined, {teamId}, {authToken, socket}));
  });

  test('throws when no websocket is present', async () => {
    const authToken = {};
    await expectAsyncToThrow(endMeeting.resolve(undefined, {teamId: 'foo'}, {authToken}));
  });

  test('throw when the caller is not a team member', async () => {
    // SETUP
    const mockDB = new MockDB();
    const {user} = await mockDB.init();
    const authToken = mockAuthToken(user[1]);

    // TEST
    await expectAsyncToThrow(endMeeting.resolve(undefined, {teamId: 'foo'}, {authToken, socket}));
  });
});
