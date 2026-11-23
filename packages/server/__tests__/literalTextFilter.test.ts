import getKysely from '../postgres/getKysely'
import {CipherId} from '../utils/CipherId'
import {sendPublic, signUp} from './common'

afterAll(async () => {
  await getKysely().destroy()
})

const TEXTS = ['50% done', '500 days', 'a_b', 'axb', 'c\\d', 'cd']

const CREATE_PAGE = `
  mutation CreatePage {
    createPage {
      page {
        id
      }
    }
  }
`

const LIST_PAGES = `
  query ListPages($textFilter: String) {
    viewer {
      pages(first: 100, textFilter: $textFilter) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`

const CREATE_TASK = `
  mutation CreateTask($newTask: CreateTaskInput!) {
    createTask(newTask: $newTask) {
      task {
        id
      }
    }
  }
`

const LIST_TASKS = `
  query ListTasks($filterQuery: String, $teamIds: [ID!]) {
    viewer {
      tasks(first: 100, filterQuery: $filterQuery, teamIds: $teamIds) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`

const idsOf = (connection: {edges: {node: {id: string}}[]}) =>
  connection.edges.map(({node}) => node.id)

test('a page title filter matches %, _ and \\ as typed', async () => {
  const {cookie} = await signUp()
  const titleById = new Map<string, string>()
  for (const title of TEXTS) {
    const created = await sendPublic({query: CREATE_PAGE, cookie})
    expect(created.errors).toBeUndefined()
    const pageId = created.data.createPage.page.id as string
    await getKysely()
      .updateTable('Page')
      .set({title})
      .where('id', '=', CipherId.fromClient(pageId)[0])
      .execute()
    titleById.set(pageId, title)
  }
  const titlesMatching = async (textFilter: string) => {
    const res = await sendPublic({query: LIST_PAGES, variables: {textFilter}, cookie})
    expect(res.errors).toBeUndefined()
    return idsOf(res.data.viewer.pages).map((id) => titleById.get(id))
  }

  expect(await titlesMatching('50%')).toEqual(['50% done'])
  expect(await titlesMatching('a_b')).toEqual(['a_b'])
  expect(await titlesMatching('c\\d')).toEqual(['c\\d'])
})

test('a task filter matches % and _ as typed', async () => {
  const {cookie, userId, teamId} = await signUp()
  const textById = new Map<string, string>()
  for (const text of TEXTS) {
    const created = await sendPublic({
      query: CREATE_TASK,
      variables: {newTask: {status: 'active', teamId, userId}},
      cookie
    })
    expect(created.errors).toBeUndefined()
    const taskId = created.data.createTask.task.id as string
    await getKysely()
      .updateTable('Task')
      .set({plaintextContent: text})
      .where('id', '=', taskId)
      .execute()
    textById.set(taskId, text)
  }
  const textsMatching = async (filterQuery: string) => {
    const res = await sendPublic({
      query: LIST_TASKS,
      variables: {filterQuery, teamIds: [teamId]},
      cookie
    })
    expect(res.errors).toBeUndefined()
    return idsOf(res.data.viewer.tasks).map((id) => textById.get(id))
  }

  expect(await textsMatching('50%')).toEqual(['50% done'])
  expect(await textsMatching('a_b')).toEqual(['a_b'])
})
