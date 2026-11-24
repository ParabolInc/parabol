import {readFileSync} from 'fs'
import {
  buildSchema,
  type GraphQLInputObjectType,
  type GraphQLObjectType,
  type NonNullTypeNode,
  parse,
  parseType,
  print,
  typeFromAST
} from 'graphql'
import path from 'path'
import compileOperationTool from '../compileOperationTool'
import getVariableSchema from '../getVariableSchema'
import {readAnnotations, writeAnnotations} from '../toolAnnotations'

const schema = buildSchema(
  readFileSync(path.join(__dirname, '../../graphql/public/schema.graphql'), 'utf8')
)
const fileName = 'Test.graphql'
const compile = (source: string) => compileOperationTool(schema, source, fileName)

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
  const teamIdsArg = (schema.getType('User') as GraphQLObjectType)
    .getFields()
    .tasks!.args.find(({name}) => name === 'teamIds')!
  expect(tool.inputSchema.properties).toEqual({
    first: {type: 'integer', default: 50, description: 'Most tasks to return'},
    teamIds: {type: 'array', items: {type: 'string'}, description: teamIdsArg.description}
  })
  const fromInput = compile(`# Make one
mutation CreateTask($teamId: ID!) { createTask(newTask: {teamId: $teamId, status: active}) { task { id } } }`)
  const teamIdField = (schema.getType('CreateTaskInput') as GraphQLInputObjectType).getFields()
    .teamId!
  expect(fromInput.inputSchema.properties!.teamId).toEqual({
    type: 'string',
    description: teamIdField.description
  })
})

test('maps GraphQL types to JSON Schema', () => {
  const map = (type: string) =>
    getVariableSchema(
      schema,
      typeFromAST(schema, parseType(type) as NonNullTypeNode)!,
      'Test.graphql'
    )
  expect(map('ID!')).toEqual({type: 'string'})
  expect(map('Int')).toEqual({type: 'integer'})
  expect(map('Float')).toEqual({type: 'number'})
  expect(map('Boolean')).toEqual({type: 'boolean'})
  expect(map('DateTime')).toMatchObject({type: 'string', format: 'date-time'})
  expect(map('[TaskStatusEnum!]')).toMatchObject({
    type: 'array',
    items: {type: 'string', enum: ['active', 'stuck', 'done', 'future']}
  })
  expect(map('[PageContentEditInput!]!')).toMatchObject({
    type: 'array',
    items: {
      type: 'object',
      required: ['oldText', 'newText'],
      properties: {
        oldText: {type: 'string'},
        newText: {type: 'string'},
        replaceAll: {type: 'boolean'}
      }
    }
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
  ['# x\nquery Q { viewer { nope } }', 'Test.graphql: Cannot query field "nope"'],
  ['# x\nquery A { viewer { id } }\nquery B { viewer { id } }', 'exactly one operation'],
  ['# x\n{ viewer { id } }', 'named'],
  ['# x\nsubscription S { __typename }', 'query or a mutation'],
  ['query Q { viewer { id } }', 'description comment'],
  ['# x\n\nquery Q { viewer { id } }', 'description comment'],
  [
    '# x\nmutation U($file: File!) { uploadUserAsset(file: $file, scope: User, scopeKey: "u") { url } }',
    'File'
  ]
])('throws, naming the file: %s', (source, message) => {
  expect(() => compile(source)).toThrow(message)
  expect(() => compile(source)).toThrow(/^Test\.graphql: /)
})
