/* eslint-env jest */
import getRethink from '../../../database/rethinkDriver'
import mockAuthToken from '../../../__tests__/setup/mockAuthToken'
import MockDate from 'mockdate'
import { __aMinuteAgo, __anHourAgo, __now } from '../../../__tests__/setup/mockTimes'
import fetchAndSerialize from '../../../__tests__/utils/fetchAndSerialize'
import DynamicSerializer from 'dynamic-serializer'
import MockDB from '../../../__tests__/setup/MockDB'
import socket from '../../../__mocks__/socket'
import { DONE } from 'parabol-client/utils/constants'
import convertToRichText from '../../../__tests__/setup/convertToRichText'
import updateTask from '../updateTask'
import makeDataLoader from '../../../__tests__/setup/makeDataLoader'

MockDate.set(__now)
console.error = jest.fn()

describe('updateTask', () => {
  test('updates the sortOrder without changing updatedAt or making a history item', async () => {
    // SETUP
    const r = await getRethink()
    const dynamicSerializer = new DynamicSerializer()
    const mockDB = new MockDB()
    const { task, user } = await mockDB.init().newTask()
    const taskId = task[0].id
    const authToken = mockAuthToken(user[7])
    const dataLoader = makeDataLoader(authToken)

    // TEST
    const updatedTask = {
      id: taskId,
      sortOrder: 2
    }
    await updateTask.resolve(undefined, { updatedTask }, { authToken, dataLoader, socket })

    // VERIFY
    const db = await fetchAndSerialize(
      {
        task: r.table('Task').get(taskId),
        taskHistory: r
          .table('TaskHistory')
          .between([taskId, r.minval], [taskId, r.maxval], {
            index: 'taskIdUpdatedAt'
          })
          .orderBy({ index: 'taskIdUpdatedAt' })
      },
      dynamicSerializer
    )
    expect(db).toMatchSnapshot()
    expect(dataLoader.isShared()).toEqual(true)
  })

  test('updates the content of the task', async () => {
    // SETUP
    const r = await getRethink()
    const dynamicSerializer = new DynamicSerializer()
    const mockDB = new MockDB()
    const { task, user } = await mockDB.init().newTask()
    const taskId = task[0].id
    const authToken = mockAuthToken(user[7])
    const dataLoader = makeDataLoader(authToken)
    // TEST
    const updatedTask = {
      id: taskId,
      content: convertToRichText('Updated content')
    }
    await updateTask.resolve(undefined, { updatedTask }, { authToken, dataLoader, socket })

    // VERIFY
    const db = await fetchAndSerialize(
      {
        task: r.table('Task').get(taskId),
        taskHistory: r
          .table('TaskHistory')
          .between([taskId, r.minval], [taskId, r.maxval], {
            index: 'taskIdUpdatedAt'
          })
          .orderBy({ index: 'taskIdUpdatedAt' })
      },
      dynamicSerializer
    )
    expect(db).toMatchSnapshot()
    expect(dataLoader.isShared()).toEqual(true)
  })

  test('updates the teamMember of the task slowly and trigger a new history item', async () => {
    // SETUP
    const r = await getRethink()
    const dynamicSerializer = new DynamicSerializer()
    const mockDB = new MockDB()
    const { task, teamMember, user } = await mockDB
      .init()
      .newTask({ updatedAt: new Date(__anHourAgo) })
      .newTaskHistory()
    const taskId = task[0].id
    const authToken = mockAuthToken(user[7])
    const dataLoader = makeDataLoader(authToken)

    // TEST
    const updatedTask = {
      id: taskId,
      teamMemberId: teamMember[5].id
    }
    await updateTask.resolve(undefined, { updatedTask }, { authToken, dataLoader, socket })

    // VERIFY
    const db = await fetchAndSerialize(
      {
        task: r.table('Task').get(taskId),
        taskHistory: r
          .table('TaskHistory')
          .between([taskId, r.minval], [taskId, r.maxval], {
            index: 'taskIdUpdatedAt'
          })
          .orderBy({ index: 'taskIdUpdatedAt' })
      },
      dynamicSerializer
    )
    expect(db).toMatchSnapshot()
    expect(dataLoader.isShared()).toEqual(true)
  })

  test('updates the content of the task quickly and do not trigger a new history item', async () => {
    // SETUP
    const r = await getRethink()
    const dynamicSerializer = new DynamicSerializer()
    const mockDB = new MockDB()
    const { task, user } = await mockDB
      .init()
      .newTask({ updatedAt: new Date(__aMinuteAgo) })
      .newTaskHistory()
    const taskId = task[0].id
    const authToken = mockAuthToken(user[7])
    const dataLoader = makeDataLoader(authToken)

    // TEST
    const updatedTask = {
      id: taskId,
      content: convertToRichText('Updated content')
    }
    await updateTask.resolve(undefined, { updatedTask }, { authToken, dataLoader, socket })

    // VERIFY
    const db = await fetchAndSerialize(
      {
        task: r.table('Task').get(taskId),
        taskHistory: r
          .table('TaskHistory')
          .between([taskId, r.minval], [taskId, r.maxval], {
            index: 'taskIdUpdatedAt'
          })
          .orderBy({ index: 'taskIdUpdatedAt' })
      },
      dynamicSerializer
    )
    expect(db).toMatchSnapshot()
    expect(dataLoader.isShared()).toEqual(true)
  })

  test('updates the status of the task', async () => {
    // SETUP
    const r = await getRethink()
    const dynamicSerializer = new DynamicSerializer()
    const mockDB = new MockDB()
    const { task, user } = await mockDB.init().newTask()
    const taskId = task[0].id
    const authToken = mockAuthToken(user[7])
    const dataLoader = makeDataLoader(authToken)

    // TEST
    const updatedTask = {
      id: taskId,
      status: DONE
    }
    await updateTask.resolve(undefined, { updatedTask }, { authToken, dataLoader, socket })

    // VERIFY
    const db = await fetchAndSerialize(
      {
        task: r.table('Task').get(taskId),
        taskHistory: r
          .table('TaskHistory')
          .between([taskId, r.minval], [taskId, r.maxval], {
            index: 'taskIdUpdatedAt'
          })
          .orderBy({ index: 'taskIdUpdatedAt' })
      },
      dynamicSerializer
    )
    expect(db).toMatchSnapshot()
    expect(dataLoader.isShared()).toEqual(true)
  })

  test('return error when the caller is not a team member', async () => {
    // SETUP
    const mockDB = new MockDB()
    const { task, user } = await mockDB.init().newTask()
    const authToken = mockAuthToken(user[1], { tms: ['foo'] })
    const taskId = task[0].id
    const dataLoader = makeDataLoader(authToken)
    // TEST
    const updatedTask = {
      id: taskId,
      status: DONE
    }
    const res = await updateTask.resolve(undefined, { updatedTask }, { authToken, dataLoader, socket })
    expect(res).toEqual(expect.objectContaining({ error: expect.any(Object) }))
  })
})
