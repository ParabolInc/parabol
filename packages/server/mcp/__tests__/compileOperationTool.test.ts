import {assertInputType, buildSchema, parse, parseType, print, typeFromAST} from 'graphql'
import compileOperationTool from '../compileOperationTool'
import getVariableSchema from '../getVariableSchema'
import {readAnnotations, writeAnnotations} from '../toolAnnotations'

const schema = buildSchema(`
  scalar DateTime
  scalar File
  scalar URL

  enum TaskStatusEnum {
    active
    stuck
    done
    future
  }

  enum AssetScopeEnum {
    User
    Page
  }

  enum ReportViewEnum {
    "One value"
    NUMBER
    "A line over time"
    LINE
    TABLE
  }

  input ReportSpecInput {
    """How to show the report"""
    showAs: ReportViewEnum!
  }

  type Task {
    id: ID!
    parent: Task
  }

  type TaskEdge {
    node: Task!
  }

  type TaskConnection {
    edges: [TaskEdge!]!
  }

  input TaskFilterInput {
    """true to return archived tasks"""
    archived: Boolean! = false
    statusFilters: [TaskStatusEnum!]
  }

  input TaskFilterGroupInput {
    anyOf: [TaskFilterGroupInput!]
  }

  type User {
    id: ID!
    tasks(
      """the number of tasks to return"""
      first: Int!
      """the datetime cursor"""
      after: DateTime
      """a list of team Ids that you want tasks for"""
      teamIds: [ID!]
      filter: TaskFilterInput
      filterGroup: TaskFilterGroupInput
    ): TaskConnection!
  }

  type Query {
    viewer: User!
  }

  input CreateTaskInput {
    sortOrder: Float
    status: TaskStatusEnum!
    """teamId, the team the task is on"""
    teamId: ID!
  }

  type CreateTaskPayload {
    task: Task
  }

  input PageContentEditInput {
    """Text to find in the page's Markdown"""
    oldText: String!
    """Markdown to put in place of oldText"""
    newText: String!
    """Replace every occurrence of oldText instead of requiring exactly one"""
    replaceAll: Boolean
  }

  type Page {
    id: ID!
  }

  type PatchPageContentPayload {
    page: Page!
  }

  input AttachmentInput {
    file: File!
  }

  type UploadUserAssetPayload {
    url: URL
  }

  type Mutation {
    createTask(newTask: CreateTaskInput!): CreateTaskPayload!
    patchPageContent(pageId: ID!, edits: [PageContentEditInput!]!): PatchPageContentPayload!
    uploadUserAsset(file: File!, scope: AssetScopeEnum!, scopeKey: ID!): UploadUserAssetPayload!
    attachFile(attachment: AttachmentInput!): UploadUserAssetPayload!
  }
`)
const fileName = 'Test.graphql'
const compile = (source: string) => compileOperationTool(schema, source, fileName)
const map = (type: string) =>
  getVariableSchema(schema, assertInputType(typeFromAST(schema, parseType(type))), fileName)

test('names the tool after the operation in snake case', () => {
  const tool = compile('# Who am I\nquery GetMe { viewer { id } }')
  expect(tool.name).toBe('get_me')
  expect(tool.title).toBe('Get me')
})

test('takes the description from the comment lines directly above the operation', () => {
  expect(
    compile('# List tasks.\n# Newest first.\nquery ListTasks { viewer { id } }').description
  ).toBe('List tasks. Newest first.')
})

test('describes a variable from its comment, else from the argument or input field it feeds', () => {
  const tool = compile(`# Tasks
query ListTasks(
  # Most tasks to return
  $first: Int = 50
  $teamIds: [ID!]
) { viewer { tasks(first: $first, teamIds: $teamIds) { edges { node { id } } } } }`)
  expect(tool.inputSchema.properties).toEqual({
    first: {type: 'integer', default: 50, description: 'Most tasks to return'},
    teamIds: {
      type: 'array',
      items: {type: 'string'},
      description: 'a list of team Ids that you want tasks for'
    }
  })
  const fromInput = compile(`# Make one
mutation CreateTask($teamId: ID!) { createTask(newTask: {teamId: $teamId, status: active}) { task { id } } }`)
  expect(fromInput.inputSchema.properties!.teamId).toEqual({
    type: 'string',
    description: 'teamId, the team the task is on'
  })
})

test('ignores a trailing comment on the previous line', () => {
  const tool = compile(`# Tasks
query ListTasks(
  $first: Int = 50 # page size
  $teamIds: [ID!]
) { viewer { tasks(first: $first, teamIds: $teamIds) { edges { node { id } } } } }`)
  expect(tool.inputSchema.properties!.teamIds).toMatchObject({
    description: 'a list of team Ids that you want tasks for'
  })
})

test('maps GraphQL types to JSON Schema', () => {
  expect(map('ID!')).toEqual({type: 'string'})
  expect(map('Int')).toEqual({type: 'integer'})
  expect(map('Float')).toEqual({type: 'number'})
  expect(map('Boolean')).toEqual({type: 'boolean'})
  expect(map('DateTime')).toEqual({type: 'string', format: 'date-time'})
  expect(map('URL')).toEqual({type: 'string'})
  expect(map('[TaskStatusEnum!]')).toEqual({
    type: 'array',
    items: {type: 'string', enum: ['active', 'stuck', 'done', 'future']}
  })
  expect(map('[PageContentEditInput!]!')).toEqual({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        oldText: {type: 'string', description: "Text to find in the page's Markdown"},
        newText: {type: 'string', description: 'Markdown to put in place of oldText'},
        replaceAll: {
          type: 'boolean',
          description: 'Replace every occurrence of oldText instead of requiring exactly one'
        }
      },
      required: ['oldText', 'newText'],
      additionalProperties: false
    }
  })
})

test('describes the enum values that have descriptions, after what the field is for', () => {
  const valueDescriptions = 'NUMBER: One value\nLINE: A line over time'
  expect(map('ReportViewEnum!')).toEqual({
    type: 'string',
    enum: ['NUMBER', 'LINE', 'TABLE'],
    description: valueDescriptions
  })
  expect(map('ReportSpecInput')).toEqual({
    type: 'object',
    properties: {
      showAs: {
        type: 'string',
        enum: ['NUMBER', 'LINE', 'TABLE'],
        description: `How to show the report\n${valueDescriptions}`
      }
    },
    required: ['showAs'],
    additionalProperties: false
  })
})

test('an input field default appears as default and leaves the field optional', () => {
  expect(map('TaskFilterInput')).toEqual({
    type: 'object',
    properties: {
      archived: {type: 'boolean', default: false, description: 'true to return archived tasks'},
      statusFilters: {
        type: 'array',
        items: {type: 'string', enum: ['active', 'stuck', 'done', 'future']}
      }
    },
    additionalProperties: false
  })
})

test('requires non-null variables without a default', () => {
  const tool = compile(`# Edit
mutation EditPage($pageId: ID!, $edits: [PageContentEditInput!]!) { patchPageContent(pageId: $pageId, edits: $edits) { page { id } } }`)
  expect(tool.inputSchema.required).toEqual(['pageId', 'edits'])
})

test('marks queries read-only and mutations destructive', () => {
  expect(compile('# Q\nquery Q { viewer { id } }').annotations).toEqual(readAnnotations)
  expect(
    compile(
      '# M\nmutation M($pageId: ID!, $edits: [PageContentEditInput!]!) { patchPageContent(pageId: $pageId, edits: $edits) { page { id } } }'
    ).annotations
  ).toEqual(writeAnnotations)
})

test('a nullable variable without a default is optional', () => {
  const tool = compile(`# Q
query Q($after: DateTime) { viewer { tasks(first: 1, after: $after) { edges { node { id } } } } }`)
  expect(tool.inputSchema.required).toBeUndefined()
})

test('keeps the printed operation as the document', () => {
  const source = '# Q\nquery   Q { viewer {   id } }'
  expect(compile(source).document).toBe(print(parse(source)))
})

test('allows fragments defined in the same file', () => {
  const tool = compile(`# Q
query Q { viewer { ...ViewerId } }
fragment ViewerId on User { id }`)
  expect(tool.name).toBe('q')
})

test.each([
  [
    'an invalid operation',
    '# x\nquery Q { viewer { nope } }',
    'Test.graphql: Cannot query field "nope"'
  ],
  [
    'two operations',
    '# x\nquery A { viewer { id } }\nquery B { viewer { id } }',
    'exactly one operation'
  ],
  ['an anonymous operation', '# x\n{ viewer { id } }', 'named'],
  ['a subscription', '# x\nsubscription S { __typename }', 'query or a mutation'],
  ['no description', 'query Q { viewer { id } }', 'description comment'],
  ['a detached description', '# x\n\nquery Q { viewer { id } }', 'description comment'],
  [
    'a File variable',
    '# x\nmutation U($file: File!) { uploadUserAsset(file: $file, scope: User, scopeKey: "u") { url } }',
    'a File variable has no JSON Schema form'
  ],
  [
    'a File inside an input object',
    '# x\nmutation A($attachment: AttachmentInput!) { attachFile(attachment: $attachment) { url } }',
    'a File variable has no JSON Schema form'
  ],
  [
    'a recursive input',
    '# x\nquery Q($filterGroup: TaskFilterGroupInput) { viewer { tasks(first: 1, filterGroup: $filterGroup) { edges { node { id } } } } }',
    'input type TaskFilterGroupInput refers to itself'
  ]
])('throws for %s, naming the file', (_label, source, message) => {
  expect(() => compile(source)).toThrow(message)
  expect(() => compile(source)).toThrow(/^Test\.graphql: /)
})

test('throws when the operation costs more than the cap, naming the file, cost and cap', () => {
  const tasksQuery = (first: number) =>
    `# Q\nquery Q { viewer { tasks(first: ${first}) { edges { node { id } } } } }`
  expect(() => compile(tasksQuery(15))).not.toThrow()
  expect(() => compile(tasksQuery(16))).toThrow(
    'Test.graphql: the operation costs 311, over the cap of 300'
  )
})

test('throws when the operation nests deeper than the limit', () => {
  const parents = 8
  const source = `# Q\nquery Q { viewer { tasks(first: 1) { edges { node { ${'parent { '.repeat(parents)}id${' }'.repeat(parents)} } } } } }`
  expect(() => compile(source)).toThrow(
    'Test.graphql: the operation nests 13 deep, over the limit of 12'
  )
})
