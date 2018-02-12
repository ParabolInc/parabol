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
import updateTask from 'server/graphql/mutations/updateTask';
import makeDataLoader from 'server/__tests__/setup/makeDataLoader';

MockDate.set(__now);
console.error = jest.fn();

describe('updateTask', () => {
  test('updates the sortOrder without changing updatedAt or making a history item', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {task, user} = await mockDB.init()
      .newTask();
    const taskId = task[0].id;
    const authToken = mockAuthToken(user[7]);
    const dataLoader = makeDataLoader(authToken);

    // TEST
    const updatedTask = {
      id: taskId,
      sortOrder: 2
    };
    await updateTask.resolve(undefined, {updatedTask}, {authToken, dataLoader, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      task: r.table('Task').get(taskId),
      taskHistory: r.table('TaskHistory')
        .between([taskId, r.minval], [taskId, r.maxval], {index: 'taskIdUpdatedAt'})
        .orderBy({index: 'taskIdUpdatedAt'})
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(dataLoader.isShared()).toEqual(true);
  });

  test('updates the content of the task', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {task, user} = await mockDB.init()
      .newTask();
    const taskId = task[0].id;
    const authToken = mockAuthToken(user[7]);
    const dataLoader = makeDataLoader(authToken);
    // TEST
    const updatedTask = {
      id: taskId,
      content: convertToRichText('Updated content')
    };
    await updateTask.resolve(undefined, {updatedTask}, {authToken, dataLoader, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      task: r.table('Task').get(taskId),
      taskHistory: r.table('TaskHistory')
        .between([taskId, r.minval], [taskId, r.maxval], {index: 'taskIdUpdatedAt'})
        .orderBy({index: 'taskIdUpdatedAt'})
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(dataLoader.isShared()).toEqual(true);
  });

  test('updates the teamMember of the task slowly and trigger a new history item', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {task, teamMember, user} = await mockDB.init()
      .newTask({updatedAt: new Date(__anHourAgo)})
      .newTaskHistory();
    const taskId = task[0].id;
    const authToken = mockAuthToken(user[7]);
    const dataLoader = makeDataLoader(authToken);

    // TEST
    const updatedTask = {
      id: taskId,
      teamMemberId: teamMember[5].id
    };
    await updateTask.resolve(undefined, {updatedTask}, {authToken, dataLoader, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      task: r.table('Task').get(taskId),
      taskHistory: r.table('TaskHistory')
        .between([taskId, r.minval], [taskId, r.maxval], {index: 'taskIdUpdatedAt'})
        .orderBy({index: 'taskIdUpdatedAt'})
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(dataLoader.isShared()).toEqual(true);
  });

  test('updates the content of the task quickly and do not trigger a new history item', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {task, user} = await mockDB.init()
      .newTask({updatedAt: new Date(__aMinuteAgo)})
      .newTaskHistory();
    const taskId = task[0].id;
    const authToken = mockAuthToken(user[7]);
    const dataLoader = makeDataLoader(authToken);

    // TEST
    const updatedTask = {
      id: taskId,
      content: convertToRichText('Updated content')
    };
    await updateTask.resolve(undefined, {updatedTask}, {authToken, dataLoader, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      task: r.table('Task').get(taskId),
      taskHistory: r.table('TaskHistory')
        .between([taskId, r.minval], [taskId, r.maxval], {index: 'taskIdUpdatedAt'})
        .orderBy({index: 'taskIdUpdatedAt'})
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(dataLoader.isShared()).toEqual(true);
  });

  test('updates the status of the task', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {task, user} = await mockDB.init()
      .newTask();
    const taskId = task[0].id;
    const authToken = mockAuthToken(user[7]);
    const dataLoader = makeDataLoader(authToken);

    // TEST
    const updatedTask = {
      id: taskId,
      status: DONE
    };
    await updateTask.resolve(undefined, {updatedTask}, {authToken, dataLoader, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      task: r.table('Task').get(taskId),
      taskHistory: r.table('TaskHistory')
        .between([taskId, r.minval], [taskId, r.maxval], {index: 'taskIdUpdatedAt'})
        .orderBy({index: 'taskIdUpdatedAt'})
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(dataLoader.isShared()).toEqual(true);
  });

  test('throw when the caller is not a team member', async () => {
    // SETUP
    const mockDB = new MockDB();
    const {task, user} = await mockDB.init()
      .newTask();
    const authToken = mockAuthToken(user[1], {tms: ['foo']});
    const taskId = task[0].id;
    const dataLoader = makeDataLoader(authToken);
    // TEST
    const updatedTask = {
      id: taskId,
      status: DONE
    };
    await expectAsyncToThrow(updateTask.resolve(undefined, {updatedTask}, {authToken, dataLoader, socket}),
      [mockDB.context.team.id]);
  });
});
