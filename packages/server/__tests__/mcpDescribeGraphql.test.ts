import {callTool, createPersonalAccessToken, expectToolErrorCode} from './mcpClient'

const describeGraphql = async (token: string, name: string) => {
  const result = await callTool(token, 'describe_graphql', {name})
  expect(result.isError ? result.content[0]!.text : undefined).toBeUndefined()
  return result.content[0]!.text
}

test('describe_graphql gives a mutation with its arguments and the input types of those arguments, to any connection', async () => {
  const token = await createPersonalAccessToken(['USERS_READ'])

  const createPage = await describeGraphql(token, 'Mutation.createPage')
  expect(createPage).toContain('createPage(')
  expect(createPage).toContain('teamId: ID')
  expect(createPage).toContain('parentPageId: ID')
  expect(createPage).toContain('): CreatePagePayload!')
  expect(createPage).not.toContain('deleteTask(')

  const createTask = await describeGraphql(token, 'Mutation.createTask')
  expect(createTask).toContain('newTask: CreateTaskInput!')
  expect(createTask).toContain('input CreateTaskInput {')
  expect(createTask).toContain('enum AreaEnum {')
  expect(createTask).not.toContain('input CreateTaskIntegrationInput')
})

test('describe_graphql gives a type with the descriptions of its fields', async () => {
  const token = await createPersonalAccessToken(['USERS_READ'])
  const task = await describeGraphql(token, 'Task')
  expect(task).toContain('type Task implements Threadable {')
  expect(task).toContain('"""The rich text body of the item"""\n  content: String!')
})

test('describe_graphql refuses a name that is not in the schema with the closest matches', async () => {
  const token = await createPersonalAccessToken(['USERS_READ'])
  expect(
    expectToolErrorCode(await callTool(token, 'describe_graphql', {name: 'Taks'}), 'BAD_USER_INPUT')
  ).toContain('Did you mean "Task"')
  expect(
    expectToolErrorCode(
      await callTool(token, 'describe_graphql', {name: 'Mutation.createPag'}),
      'BAD_USER_INPUT'
    )
  ).toContain('Did you mean "Mutation.createPage"')
  expectToolErrorCode(await callTool(token, 'describe_graphql', {name: ' '}), 'BAD_USER_INPUT')
})

test('describe_graphql lists the fields of a type too long for one answer and describes any one of them in full', async () => {
  const token = await createPersonalAccessToken(['USERS_READ'])
  const mutation = await describeGraphql(token, 'Mutation')
  expect(mutation.length).toBeLessThanOrEqual(20_000)
  expect(mutation.startsWith('type Mutation {\n')).toBe(true)
  expect(mutation).toContain('\n  createPage(teamId, parentPageId): CreatePagePayload!\n')
  expect(mutation).toContain('\n  createTask(newTask, area): CreateTaskPayload!\n')
  expect(mutation).toMatch(/\n {2}autogroup\(meetingId\): AutogroupPayload! @deprecated\n/)
  expect(mutation).not.toContain('"""')
  expect(mutation).toMatch(
    /fields, too many to show in full\. Describe one as Mutation\.\w+ for its/
  )

  const user = await describeGraphql(token, 'User')
  expect(user).toContain('"""')
  expect(user.length).toBeLessThanOrEqual(20_000)

  const createTask = await describeGraphql(token, 'Mutation.createTask')
  expect(createTask).toContain('"""Create a new task, triggering a CreateCard for other viewers"""')
  expect(createTask).toContain('input CreateTaskInput {')
  expect(createTask.length).toBeLessThan(10_000)
})

test('describe_graphql names the root field that a bare field name belongs to', async () => {
  const token = await createPersonalAccessToken(['USERS_READ'])
  const message = expectToolErrorCode(
    await callTool(token, 'describe_graphql', {name: 'createTask'}),
    'BAD_USER_INPUT'
  )
  expect(message).toBe('No type named "createTask". Did you mean "Mutation.createTask"?')
})

test('describe_graphql refuses a name too long to be a type or field', async () => {
  const token = await createPersonalAccessToken(['USERS_READ'])
  const result = await callTool(token, 'describe_graphql', {name: 'x'.repeat(201)})
  expectToolErrorCode(result, 'BAD_USER_INPUT')
  expect(result.content[0]!.text.length).toBeLessThan(500)
})
