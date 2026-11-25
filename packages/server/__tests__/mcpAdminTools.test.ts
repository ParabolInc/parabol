import {randomUUID, randomUUIDv7} from 'crypto'
import getKysely from '../postgres/getKysely'
import getRedis from '../utils/getRedis'
import {createOrgAdmin, getTestEmail, HOST, PROTOCOL, sendPublic} from './common'
import {
  addTeammate,
  bearer,
  callTool,
  callToolForData,
  createPersonalAccessToken,
  expectToolErrorCode,
  getChargedCost,
  PNG_BASE64,
  signUpWithoutAI
} from './mcpClient'

afterAll(async () => {
  await getRedis().quit()
})

const ADMIN_SCOPES = [
  'USERS_READ',
  'TEAMS_READ',
  'TEAMS_WRITE',
  'TEMPLATES_READ',
  'TEMPLATES_WRITE',
  'MEETINGS_WRITE',
  'PAGES_READ',
  'PAGES_WRITE',
  'TASKS_READ',
  'TASKS_WRITE'
]

const COLUMNS = [{question: 'Glad'}, {question: 'Sad'}]

const ADD_TEAM = `
  mutation AddTeam($newTeam: NewTeamInput!) {
    addTeam(newTeam: $newTeam) {
      team {
        id
      }
    }
  }
`

const ADD_POKER_TEMPLATE = `
  mutation AddPokerTemplate($teamId: ID!) {
    addPokerTemplate(teamId: $teamId) {
      pokerTemplate {
        id
        dimensions {
          name
        }
      }
    }
  }
`

type ListedTemplate = {
  id: string
  name: string
  scope: string
  prompts?: string[]
  dimensions?: {name: string; scale: string}[]
  questions?: string[]
}
type ListedScale = {id: string; name: string; values: string[]}

const listTemplates = async (token: string, teamId: string, meetingType: string) =>
  (await callToolForData(token, 'list_templates', {teamId, meetingType})) as {
    templates: ListedTemplate[]
    scales?: ListedScale[]
  }

const getIds = (items: {id: string}[]) => items.map(({id}) => id)

const signUpAdmin = async () => {
  const member = await signUpWithoutAI()
  return {
    ...member,
    token: await createPersonalAccessToken(ADMIN_SCOPES, {cookie: member.cookie})
  }
}

const addPokerTemplate = async (cookie: string, teamId: string) => {
  const added = await sendPublic({query: ADD_POKER_TEMPLATE, variables: {teamId}, cookie})
  expect(added.errors).toBeUndefined()
  return added.data.addPokerTemplate.pokerTemplate as {id: string; dimensions: {name: string}[]}
}

const setTemplateScope = (templateId: string, scope: 'TEAM' | 'ORGANIZATION') =>
  getKysely().updateTable('MeetingTemplate').set({scope}).where('id', '=', templateId).execute()

const isTemplateActive = async (templateId: string) => {
  const {isActive} = await getKysely()
    .selectFrom('MeetingTemplate')
    .select('isActive')
    .where('id', '=', templateId)
    .executeTakeFirstOrThrow()
  return isActive
}

const isScaleRemoved = async (scaleId: string) => {
  const {removedAt} = await getKysely()
    .selectFrom('TemplateScale')
    .select('removedAt')
    .where('id', '=', scaleId)
    .executeTakeFirstOrThrow()
  return removedAt !== null
}

test('list_templates lists the retro templates a team can pick: its own, org-wide and built-in ones', async () => {
  const {cookie, orgId, teamId} = await signUpWithoutAI()
  const addedTeam = await sendPublic({
    query: ADD_TEAM,
    variables: {newTeam: {name: 'Second team', orgId, isPublic: false}},
    cookie
  })
  expect(addedTeam.errors).toBeUndefined()
  const secondTeamId = addedTeam.data.addTeam.team.id
  const token = await createPersonalAccessToken(ADMIN_SCOPES, {cookie})
  const {template: own} = await callToolForData(token, 'create_retro_template', {
    teamId,
    name: 'Team Columns',
    columns: COLUMNS
  })
  const {template: secondTeams} = await callToolForData(token, 'create_retro_template', {
    teamId: secondTeamId,
    name: 'Second Team Columns',
    columns: COLUMNS
  })
  await setTemplateScope(own.id, 'TEAM')
  await setTemplateScope(secondTeams.id, 'TEAM')

  const teamOnly = await listTemplates(token, teamId, 'retrospective')
  expect(teamOnly.templates).toContainEqual({
    id: own.id,
    name: 'Team Columns',
    scope: 'TEAM',
    prompts: ['Glad', 'Sad']
  })
  expect(getIds(teamOnly.templates)).not.toContain(secondTeams.id)
  expect(teamOnly.templates).toContainEqual({
    id: 'startStopContinueTemplate',
    name: 'Start, Stop, Continue',
    scope: 'PUBLIC',
    prompts: ['Start', 'Stop', 'Continue']
  })
  expect(teamOnly.scales).toBeUndefined()

  await setTemplateScope(secondTeams.id, 'ORGANIZATION')
  const shared = await listTemplates(token, teamId, 'retrospective')
  expect(shared.templates).toContainEqual({
    id: secondTeams.id,
    name: 'Second Team Columns',
    scope: 'ORGANIZATION',
    prompts: ['Glad', 'Sad']
  })
})

test('list_templates lists sprint poker templates with their dimensions and the scales the team can vote with', async () => {
  const {cookie, teamId, token} = await signUpAdmin()
  const {scale} = await callToolForData(token, 'create_poker_scale', {
    teamId,
    name: 'Agent Scale',
    values: [{label: '1'}, {label: '2'}]
  })
  const pokerTemplate = await addPokerTemplate(cookie, teamId)

  const {templates, scales} = await listTemplates(token, teamId, 'poker')
  expect(templates).toContainEqual(
    expect.objectContaining({
      id: pokerTemplate.id,
      scope: 'ORGANIZATION',
      dimensions: pokerTemplate.dimensions.map(({name}) => ({name, scale: 'Fibonacci'}))
    })
  )
  expect(templates).toContainEqual({
    id: 'estimatedEffortTemplate',
    name: 'Estimated Effort',
    scope: 'PUBLIC',
    dimensions: [{name: 'Story Points', scale: 'Fibonacci'}]
  })
  expect(scales).toContainEqual({
    id: scale.id,
    name: 'Agent Scale',
    values: ['1', '2', '?', 'Pass']
  })
  expect(scales).toContainEqual(expect.objectContaining({id: 'fibonacciScale', name: 'Fibonacci'}))
})

test('list_templates lists standup and team health templates and needs a meeting type', async () => {
  const {teamId, token} = await signUpAdmin()
  const {template: standup} = await callToolForData(token, 'create_standup_template', {
    teamId,
    name: 'Agent Standup',
    prompts: [{question: 'What did you ship?'}]
  })
  const {template: teamHealth} = await callToolForData(token, 'create_team_health_template', {
    teamId,
    name: 'Agent Health',
    questions: [{question: 'We ship often.'}]
  })

  const standups = await listTemplates(token, teamId, 'teamPrompt')
  expect(standups.templates).toContainEqual(
    expect.objectContaining({
      id: standup.id,
      name: 'Agent Standup',
      prompts: ['What did you ship?']
    })
  )
  expect(standups.templates).toContainEqual(
    expect.objectContaining({id: 'teamPrompt', scope: 'PUBLIC'})
  )

  const checks = await listTemplates(token, teamId, 'teamHealth')
  expect(checks.templates).toContainEqual(
    expect.objectContaining({
      id: teamHealth.id,
      name: 'Agent Health',
      questions: ['We ship often.']
    })
  )
  expect(checks.templates).toContainEqual(
    expect.objectContaining({id: 'everythingBagelTemplate', scope: 'PUBLIC'})
  )

  expectToolErrorCode(await callTool(token, 'list_templates', {teamId}), 'BAD_USER_INPUT')
})

test('list_templates for sprint poker stays under the 300 cost cap of one operation', async () => {
  const {userId, teamId, token} = await signUpAdmin()
  const beforeList = await getChargedCost(userId)
  await listTemplates(token, teamId, 'poker')
  expect((await getChargedCost(userId)) - beforeList).toBeLessThanOrEqual(300)
})

test('a Starter agent can list templates, pick one and start a retro within the minute budget', async () => {
  const {userId, teamId, token} = await signUpAdmin()
  await callToolForData(token, 'get_me', {})
  const beforeList = await getChargedCost(userId)
  const {templates} = await listTemplates(token, teamId, 'retrospective')
  expect((await getChargedCost(userId)) - beforeList).toBeLessThanOrEqual(300)
  const sailboat = templates.find(({name}) => name === 'Sailboat')!
  await callToolForData(token, 'select_template', {templateId: sailboat.id, teamId})
  await callToolForData(token, 'start_retrospective', {teamId})
  expect(await getChargedCost(userId)).toBeLessThanOrEqual(500)
})

test('delete_template deletes retro, standup and sprint poker templates and poker scales', async () => {
  const {cookie, teamId, token} = await signUpAdmin()
  const {template: retro} = await callToolForData(token, 'create_retro_template', {
    teamId,
    name: 'Retro To Delete',
    columns: COLUMNS
  })
  const {template: standup} = await callToolForData(token, 'create_standup_template', {
    teamId,
    name: 'Standup To Delete',
    prompts: [{question: 'Anything blocking you?'}]
  })
  const pokerTemplate = await addPokerTemplate(cookie, teamId)
  const {scale} = await callToolForData(token, 'create_poker_scale', {
    teamId,
    name: 'Scale To Delete',
    values: [{label: 'S'}, {label: 'L'}]
  })

  expect(await callToolForData(token, 'delete_template', {templateId: retro.id})).toEqual({
    template: {id: retro.id, name: 'Retro To Delete'}
  })
  expect(await callToolForData(token, 'delete_template', {templateId: standup.id})).toEqual({
    template: {id: standup.id, name: 'Standup To Delete'}
  })
  expect(await callToolForData(token, 'delete_template', {templateId: pokerTemplate.id})).toEqual({
    template: {id: pokerTemplate.id, name: expect.any(String)}
  })
  expect(await callToolForData(token, 'delete_template', {scaleId: scale.id})).toEqual({
    scale: {id: scale.id}
  })

  expect(await isTemplateActive(retro.id)).toBe(false)
  expect(await isTemplateActive(standup.id)).toBe(false)
  expect(await isScaleRemoved(scale.id)).toBe(true)
  const poker = await listTemplates(token, teamId, 'poker')
  expect(getIds(poker.templates)).not.toContain(pokerTemplate.id)
  expect(getIds(poker.scales!)).not.toContain(scale.id)
})

test('delete_template refuses a team health template and a built-in template, and needs exactly one id', async () => {
  const {teamId, token} = await signUpAdmin()
  const {template: teamHealth} = await callToolForData(token, 'create_team_health_template', {
    teamId,
    name: 'Health To Keep',
    questions: [{question: 'We trust each other.'}]
  })

  const healthMessage = expectToolErrorCode(
    await callTool(token, 'delete_template', {templateId: teamHealth.id}),
    'BAD_USER_INPUT'
  )
  expect(healthMessage).toBe(
    'Only retrospective, standup and sprint poker templates can be deleted.'
  )
  expectToolErrorCode(
    await callTool(token, 'delete_template', {templateId: 'sailboatTemplate'}),
    'FORBIDDEN'
  )
  expectToolErrorCode(await callTool(token, 'delete_template', {}), 'BAD_USER_INPUT')
  expectToolErrorCode(
    await callTool(token, 'delete_template', {
      templateId: teamHealth.id,
      scaleId: 'fibonacciScale'
    }),
    'BAD_USER_INPUT'
  )

  expect(await isTemplateActive(teamHealth.id)).toBe(true)
  expect(await isTemplateActive('sailboatTemplate')).toBe(true)
  expect(await isScaleRemoved('fibonacciScale')).toBe(false)
})

test('archive_page moves a page to Trash, and read_page says when', async () => {
  const {teamId, token} = await signUpAdmin()
  const created = await callToolForData(token, 'create_page', {teamId})
  const pageId = created.createPage.page.id

  const archived = await callToolForData(token, 'archive_page', {pageId})
  expect(archived.archivePage.page).toEqual({
    id: pageId,
    title: '',
    deletedAt: expect.any(String)
  })
  const read = await callToolForData(token, 'read_page', {pageId})
  expect(read.public.page.deletedAt).toBe(archived.archivePage.page.deletedAt)
  const listed = await callToolForData(token, 'list_pages', {teamId})
  expect(
    getIds(listed.viewer.pages.edges.map(({node}: {node: {id: string}}) => node))
  ).not.toContain(pageId)
})

test('delete_task deletes a task for good', async () => {
  const {teamId, token} = await signUpAdmin()
  const created = await callToolForData(token, 'create_task', {teamId, content: 'Delete me'})
  const taskId = created.createTask.task.id

  const deleted = await callToolForData(token, 'delete_task', {taskId})
  expect(deleted.deleteTask.task).toEqual({id: taskId})
  const listed = await callToolForData(token, 'list_tasks', {teamIds: [teamId]})
  expect(
    getIds(listed.viewer.tasks.edges.map(({node}: {node: {id: string}}) => node))
  ).not.toContain(taskId)
  const row = await getKysely()
    .selectFrom('Task')
    .select('id')
    .where('id', '=', taskId)
    .executeTakeFirst()
  expect(row).toBeUndefined()
})

test('a caller off the team is refused by every tool and nothing changes', async () => {
  const owner = await signUpAdmin()
  const {teamId} = owner
  const {template} = await callToolForData(owner.token, 'create_retro_template', {
    teamId,
    name: 'Owner Columns',
    columns: COLUMNS
  })
  await setTemplateScope(template.id, 'TEAM')
  const {scale} = await callToolForData(owner.token, 'create_poker_scale', {
    teamId,
    name: 'Owner Scale',
    values: [{label: '1'}]
  })
  const page = await callToolForData(owner.token, 'create_page', {teamId})
  const pageId = page.createPage.page.id
  const task = await callToolForData(owner.token, 'create_task', {teamId, content: 'Keep me'})
  const taskId = task.createTask.task.id

  const outsider = await signUpAdmin()
  expectToolErrorCode(
    await callTool(outsider.token, 'list_templates', {teamId, meetingType: 'retrospective'}),
    'FORBIDDEN'
  )
  expectToolErrorCode(
    await callTool(outsider.token, 'delete_template', {templateId: template.id}),
    'NOT_FOUND'
  )
  expectToolErrorCode(
    await callTool(outsider.token, 'delete_template', {scaleId: scale.id}),
    'FORBIDDEN'
  )
  expectToolErrorCode(await callTool(outsider.token, 'archive_page', {pageId}), 'FORBIDDEN')
  expectToolErrorCode(await callTool(outsider.token, 'delete_task', {taskId}), 'FORBIDDEN')

  expect(await isTemplateActive(template.id)).toBe(true)
  expect(await isScaleRemoved(scale.id)).toBe(false)
  const read = await callToolForData(owner.token, 'read_page', {pageId})
  expect(read.public.page.deletedAt).toBeNull()
  const row = await getKysely()
    .selectFrom('Task')
    .select('id')
    .where('id', '=', taskId)
    .executeTakeFirst()
  expect(row).toEqual({id: taskId})
})

const UPLOAD_SCOPES = [
  'USERS_READ',
  'USERS_WRITE',
  'TEAMS_READ',
  'TEAMS_WRITE',
  'PAGES_READ',
  'PAGES_WRITE'
]

const UPLOAD_USER_ASSET = `
  mutation UploadUserAsset($file: File!, $scope: AssetScopeEnum!, $scopeKey: ID!) {
    uploadUserAsset(file: $file, scope: $scope, scopeKey: $scopeKey) {
      url
    }
  }
`

const SHARE_PAGE = `
  mutation SharePage($pageId: ID!, $subjectId: ID!, $role: PageRoleEnum) {
    updatePageAccess(pageId: $pageId, subjectType: user, subjectId: $subjectId, role: $role) {
      page {
        id
      }
    }
  }
`

const SHARE_PAGE_BY_PUBLIC_LINK = `
  mutation SharePageByPublicLink($pageId: ID!) {
    updatePageAccess(pageId: $pageId, subjectType: external, subjectId: "*", role: editor) {
      page {
        id
      }
    }
  }
`

const signUpUploader = async () => {
  const member = await signUpWithoutAI()
  return {
    ...member,
    token: await createPersonalAccessToken(UPLOAD_SCOPES, {cookie: member.cookie})
  }
}

const uploadImage = async (token: string, scope: 'User' | 'Team' | 'Page', scopeKey: string) => {
  const uploaded = await callToolForData(token, 'upload_image', {
    filename: 'a.png',
    mimeType: 'image/png',
    base64: PNG_BASE64,
    scope,
    scopeKey
  })
  return uploaded.uploadUserAsset.url as string
}

const getUploadStatus = async (url: string, token: string) =>
  (await fetch(url, {headers: bearer(token)})).status

test('delete_upload deletes your own file, and deleting it again still succeeds', async () => {
  const {userId, token} = await signUpUploader()
  const url = await uploadImage(token, 'User', userId)
  expect(await getUploadStatus(url, token)).toBe(200)

  const deleted = await callToolForData(token, 'delete_upload', {url})
  expect(deleted.deleteUserAsset).toEqual({url})
  expect(await getUploadStatus(url, token)).toBe(404)
  const deletedAgain = await callToolForData(token, 'delete_upload', {url})
  expect(deletedAgain.deleteUserAsset).toEqual({url})
})

test('a teammate deletes a team file; someone off the team, or without teams:write, is refused and the file kept', async () => {
  const owner = await signUpUploader()
  const url = await uploadImage(owner.token, 'Team', owner.teamId)
  const teammate = await addTeammate(owner.teamId, UPLOAD_SCOPES)
  const outsider = await signUpUploader()
  const teammateWithoutTeams = await createPersonalAccessToken(['PAGES_WRITE', 'USERS_WRITE'], {
    cookie: teammate.cookie
  })

  expectToolErrorCode(await callTool(outsider.token, 'delete_upload', {url}), 'FORBIDDEN')
  const missingScope = expectToolErrorCode(
    await callTool(teammateWithoutTeams, 'delete_upload', {url}),
    'FORBIDDEN'
  )
  expect(missingScope).toContain('teams:write')
  expect(await getUploadStatus(url, owner.token)).toBe(200)

  const deleted = await callToolForData(teammate.token, 'delete_upload', {url})
  expect(deleted.deleteUserAsset).toEqual({url})
  expect(await getUploadStatus(url, owner.token)).toBe(404)
})

test('a page editor deletes a page file, and a commenter or viewer is refused', async () => {
  const owner = await signUpUploader()
  const created = await callToolForData(owner.token, 'create_page', {})
  const pageId = created.createPage.page.id as string
  const url = await uploadImage(owner.token, 'Page', pageId)
  const [viewer, commenter, editor] = await Promise.all([
    signUpUploader(),
    signUpUploader(),
    signUpUploader()
  ])
  for (const [subjectId, role] of [
    [viewer.userId, 'viewer'],
    [commenter.userId, 'commenter'],
    [editor.userId, 'editor']
  ]) {
    const shared = await sendPublic({
      query: SHARE_PAGE,
      variables: {pageId, subjectId, role},
      cookie: owner.cookie
    })
    expect(shared.errors).toBeUndefined()
  }

  expectToolErrorCode(await callTool(viewer.token, 'delete_upload', {url}), 'FORBIDDEN')
  expectToolErrorCode(await callTool(commenter.token, 'delete_upload', {url}), 'FORBIDDEN')
  expect(await getUploadStatus(url, owner.token)).toBe(200)

  const deleted = await callToolForData(editor.token, 'delete_upload', {url})
  expect(deleted.deleteUserAsset).toEqual({url})
  expect(await getUploadStatus(url, owner.token)).toBe(404)
})

test('someone holding only a public edit link to a page cannot delete its files', async () => {
  const owner = await signUpUploader()
  const created = await callToolForData(owner.token, 'create_page', {})
  const pageId = created.createPage.page.id as string
  const url = await uploadImage(owner.token, 'Page', pageId)
  const shared = await sendPublic({
    query: SHARE_PAGE_BY_PUBLIC_LINK,
    variables: {pageId},
    cookie: owner.cookie
  })
  expect(shared.errors).toBeUndefined()
  const stranger = await signUpUploader()

  const refusal = expectToolErrorCode(
    await callTool(stranger.token, 'delete_upload', {url}),
    'FORBIDDEN'
  )
  expect(refusal).toBe('Only editors and owners of the page can delete its files')
  expect(await getUploadStatus(url, owner.token)).toBe(200)
})

test('an organization admin deletes an organization file and a plain member is refused', async () => {
  const admin = await createOrgAdmin(getTestEmail())
  const adminToken = await createPersonalAccessToken(['ORGS_READ', 'ORGS_WRITE'], {
    cookie: admin.cookie
  })
  const uploaded = await sendPublic({
    query: UPLOAD_USER_ASSET,
    variables: {file: null, scope: 'Organization', scopeKey: admin.orgId},
    uploadables: {file: new File([randomUUID()], 'notes.txt', {type: 'text/plain'})},
    cookie: admin.cookie
  })
  expect(uploaded.errors).toBeUndefined()
  const url = uploaded.data.uploadUserAsset.url as string
  const member = await signUpWithoutAI()
  await getKysely()
    .insertInto('OrganizationUser')
    .values({id: randomUUIDv7(), orgId: admin.orgId, userId: member.userId})
    .execute()
  const memberToken = await createPersonalAccessToken(['ORGS_READ', 'ORGS_WRITE'], {
    cookie: member.cookie
  })
  expect(await getUploadStatus(url, memberToken)).toBe(200)

  expectToolErrorCode(await callTool(memberToken, 'delete_upload', {url}), 'FORBIDDEN')
  expect(await getUploadStatus(url, adminToken)).toBe(200)

  const deleted = await callToolForData(adminToken, 'delete_upload', {url})
  expect(deleted.deleteUserAsset).toEqual({url})
  expect(await getUploadStatus(url, adminToken)).toBe(404)
})

test('a connection limited to a team cannot delete your own files', async () => {
  const {userId, teamId, cookie, token} = await signUpUploader()
  const url = await uploadImage(token, 'User', userId)
  const teamLimited = await createPersonalAccessToken(UPLOAD_SCOPES, {
    cookie,
    grantedTeamIds: [teamId]
  })

  expectToolErrorCode(await callTool(teamLimited, 'delete_upload', {url}), 'FORBIDDEN')
  expect(await getUploadStatus(url, token)).toBe(200)
})

test('delete_upload refuses a URL that is not a Parabol upload and keeps the file', async () => {
  const {userId, teamId, token} = await signUpUploader()
  const url = await uploadImage(token, 'User', userId)
  const {pathname} = new URL(url)
  const filename = pathname.split('/').at(-1)!
  const origin = `${PROTOCOL}://${HOST}`
  const refusedUrls = [
    `https://example.com${pathname}`,
    `${origin}/assets/Team/${teamId}/../../User/${userId}/assets/${filename}`,
    `${origin}/assets/User/${userId}/assets/%2e%2e/${filename}`,
    `${origin}/assets/User/${encodeURIComponent(`${userId}/assets/${filename}`)}`,
    `${origin}/assets/User/${userId}/picture/${filename}`,
    `${origin}/assets/Meeting/${userId}/assets/${filename}`,
    `${url}/extra`,
    `${url}?download=1`,
    `${origin}/self-hosted/User/${userId}/assets/${filename}`
  ]
  for (const refusedUrl of refusedUrls) {
    const result = await callTool(token, 'delete_upload', {url: refusedUrl})
    expect([refusedUrl, result.isError && JSON.parse(result.content[0]!.text)[0].code]).toEqual([
      refusedUrl,
      'BAD_USER_INPUT'
    ])
  }
  expect(await getUploadStatus(url, token)).toBe(200)
})

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
