import getRethink from 'server/database/rethinkDriver';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDate from 'mockdate';
import {__now, __aMinuteAgo, __anHourAgo} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import DynamicSerializer from 'dynamic-serializer';
import MockDB from 'server/__tests__/setup/MockDB';
import expectAsyncToThrow from 'server/__tests__/utils/expectAsyncToThrow';
import socket from 'server/__mocks__/socket';
import {DONE} from 'universal/utils/constants';
import convertToRichText from 'server/__tests__/setup/convertToRichText';
import updateProject from 'server/graphql/mutations/updateProject';

MockDate.set(__now);
console.error = jest.fn();

describe('updateProject', () => {
  test('updates the sortOrder without changing updatedAt or making a history item', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {project, user} = await mockDB.init()
      .newProject();
    const projectId = project[0].id;
    const authToken = mockAuthToken(user[7]);

    // TEST
    const updatedProject = {
      id: projectId,
      sortOrder: 2
    };
    await updateProject.resolve(undefined, {updatedProject}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      project: r.table('Project').get(projectId),
      projectHistory: r.table('ProjectHistory')
        .between([projectId, r.minval], [projectId, r.maxval], {index: 'projectIdUpdatedAt'})
        .orderBy({index: 'projectIdUpdatedAt'})
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
  });

  test('updates the content of the project', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {project, user} = await mockDB.init()
      .newProject();
    const projectId = project[0].id;
    const authToken = mockAuthToken(user[7]);

    // TEST
    const updatedProject = {
      id: projectId,
      content: convertToRichText('Updated content')
    };
    await updateProject.resolve(undefined, {updatedProject}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      project: r.table('Project').get(projectId),
      projectHistory: r.table('ProjectHistory')
        .between([projectId, r.minval], [projectId, r.maxval], {index: 'projectIdUpdatedAt'})
        .orderBy({index: 'projectIdUpdatedAt'})
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
  });

  test('updates the teamMember of the project slowly and trigger a new history item', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {project, teamMember, user} = await mockDB.init()
      .newProject({updatedAt: new Date(__anHourAgo)})
      .newProjectHistory();
    const projectId = project[0].id;
    const authToken = mockAuthToken(user[7]);

    // TEST
    const updatedProject = {
      id: projectId,
      teamMemberId: teamMember[5].id
    };
    await updateProject.resolve(undefined, {updatedProject}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      project: r.table('Project').get(projectId),
      projectHistory: r.table('ProjectHistory')
        .between([projectId, r.minval], [projectId, r.maxval], {index: 'projectIdUpdatedAt'})
        .orderBy({index: 'projectIdUpdatedAt'})
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
  });

  test('updates the content of the project quickly and do not trigger a new history item', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {project, user} = await mockDB.init()
      .newProject({updatedAt: new Date(__aMinuteAgo)})
      .newProjectHistory();
    const projectId = project[0].id;
    const authToken = mockAuthToken(user[7]);

    // TEST
    const updatedProject = {
      id: projectId,
      content: convertToRichText('Updated content')
    };
    await updateProject.resolve(undefined, {updatedProject}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      project: r.table('Project').get(projectId),
      projectHistory: r.table('ProjectHistory')
        .between([projectId, r.minval], [projectId, r.maxval], {index: 'projectIdUpdatedAt'})
        .orderBy({index: 'projectIdUpdatedAt'})
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
  });

  test('updates the status of the project', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {project, user} = await mockDB.init()
      .newProject();
    const projectId = project[0].id;
    const authToken = mockAuthToken(user[7]);

    // TEST
    const updatedProject = {
      id: projectId,
      status: DONE
    };
    await updateProject.resolve(undefined, {updatedProject}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      project: r.table('Project').get(projectId),
      projectHistory: r.table('ProjectHistory')
        .between([projectId, r.minval], [projectId, r.maxval], {index: 'projectIdUpdatedAt'})
        .orderBy({index: 'projectIdUpdatedAt'})
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
  });

  test('throw when the caller is not a team member', async () => {
    // SETUP
    const mockDB = new MockDB();
    const {project, user} = await mockDB.init()
      .newProject();
    const authToken = mockAuthToken(user[1], {tms: ['foo']});
    const projectId = project[0].id;

    // TEST
    const updatedProject = {
      id: projectId,
      status: DONE
    };
    await expectAsyncToThrow(updateProject.resolve(undefined, {updatedProject}, {authToken, socket}), [mockDB.context.team.id]);
  });
});
