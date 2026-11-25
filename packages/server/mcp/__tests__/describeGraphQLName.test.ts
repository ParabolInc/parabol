import {buildSchema} from 'graphql'
import describeGraphQLName from '../describeGraphQLName'
import {MAX_RESULT_LENGTH} from '../toolResult'

const DEPTH = 40
const WIDE_FIELD_COUNT = 3000

const nestedInputs = Array.from(
  {length: DEPTH},
  (_, level) => `
    input Nested${level} {
      "How deep this is"
      depth: Int
      ${level < DEPTH - 1 ? `child: Nested${level + 1}` : ''}
    }
  `
).join('\n')

const wideFields = Array.from(
  {length: WIDE_FIELD_COUNT},
  (_, idx) => `"Describes option ${idx} at some length so the type is big"\n option${idx}: String`
).join('\n')

const schema = buildSchema(`
  "An RFC 3339 date and time in UTC"
  scalar DateTime

  type Query {
    "Who is asking"
    viewer: User
  }

  type User {
    id: ID!
  }

  type Mutation {
    "Make a page"
    createPage(
      "The team that owns it"
      teamId: ID
      kind: PageKindEnum
      "Where the page goes"
      location: PageLocationInput
      copyOf: PageLocationInput
      since: DateTime
    ): CreatePagePayload!
    "Nest deep"
    nest(input: Nested0!): CreatePagePayload!
    "Take a lot"
    sprawl(input: WideInput!): CreatePagePayload!
  }

  type CreatePagePayload {
    page: Page
  }

  type Page {
    id: ID!
  }

  "A task on a board"
  type Task {
    "The id"
    id: ID!
    "What to do"
    plaintextContent: String
    "Where the work stands"
    status: TaskStatusEnum!
  }

  enum TaskStatusEnum {
    "Being worked"
    active
    done
  }

  enum PageKindEnum {
    DOC
    NOTE
  }

  input PageLocationInput {
    "The parent page"
    parentPageId: ID
    "The slot among siblings"
    slot: SlotInput
  }

  input SlotInput {
    index: Int
  }

  ${nestedInputs}

  input WideInput {
    ${wideFields}
  }
`)

const sdlOf = (name: string) => {
  const described = describeGraphQLName(schema, name)
  if ('error' in described) throw new Error(described.error)
  return described.sdl
}

const errorOf = (name: string) => {
  const described = describeGraphQLName(schema, name)
  if (!('error' in described)) throw new Error(`${name} was described`)
  return described.error
}

test('a type name gives the type with its descriptions', () => {
  const sdl = sdlOf('Task')
  expect(sdl).toContain('type Task {')
  expect(sdl).toContain('"""A task on a board"""')
  expect(sdl).toContain('"""What to do"""\n  plaintextContent: String')
  expect(sdl).toContain('status: TaskStatusEnum!')
  expect(sdl).not.toContain('Mutation')
})

test('an enum name gives the enum', () => {
  expect(sdlOf('TaskStatusEnum')).toContain('"""Being worked"""\n  active')
})

test('Type.field gives the field with its arguments and the input types of those arguments once', () => {
  const sdl = sdlOf('Mutation.createPage')
  expect(sdl).toContain('"""Make a page"""\n  createPage(')
  expect(sdl).toContain('"""The team that owns it"""\n    teamId: ID')
  expect(sdl).toContain('): CreatePagePayload!')
  expect(sdl.match(/input PageLocationInput \{/g)).toHaveLength(1)
  expect(sdl).toContain('"""The parent page"""\n  parentPageId: ID')
  expect(sdl).toContain('enum PageKindEnum {')
  expect(sdl).toContain('"""An RFC 3339 date and time in UTC"""\nscalar DateTime')
  expect(sdl).not.toContain('scalar ID')
  expect(sdl).not.toContain('nest(')
  expect(sdl).not.toContain('type CreatePagePayload')
})

test('an input type nested inside an argument type is left to be described by name', () => {
  const sdl = sdlOf('Mutation.createPage')
  expect(sdl).toContain('slot: SlotInput')
  expect(sdl).not.toContain('input SlotInput')
  expect(sdlOf('SlotInput')).toContain('input SlotInput {')
})

test('a field of a query type works the same way', () => {
  expect(sdlOf('Query.viewer')).toContain('viewer: User')
})

test('a deep chain of nested inputs shows one level only', () => {
  const sdl = sdlOf('Mutation.nest')
  expect(sdl).toContain('input Nested0 {')
  expect(sdl).toContain('child: Nested1')
  expect(sdl).not.toContain('input Nested1 {')
})

test('a huge type is cut at a line under the result cap with a plain note', () => {
  const described = sdlOf('WideInput')
  expect(described.length).toBeLessThanOrEqual(MAX_RESULT_LENGTH)
  expect(described).toContain('input WideInput {')
  expect(described).toContain('option0: String')
  expect(described).not.toContain(`option${WIDE_FIELD_COUNT - 1}:`)
  expect(described).toMatch(/\n…truncated: describe one field as Type\.field, or one type by name$/)
})

test('a field whose input type is huge keeps the field whole and stays under the cap', () => {
  const sdl = sdlOf('Mutation.sprawl')
  expect(sdl.length).toBeLessThanOrEqual(MAX_RESULT_LENGTH)
  expect(
    sdl.startsWith(
      'type Mutation {\n  """Take a lot"""\n  sprawl(input: WideInput!): CreatePagePayload!\n}'
    )
  ).toBe(true)
  expect(sdl).toContain('…truncated')
})

test('an unknown type names the closest types', () => {
  expect(errorOf('Taks')).toBe('No type named "Taks". Did you mean "Task"?')
})

test('a name nothing resembles says how to name one', () => {
  expect(errorOf('Zzzzzzzzzz')).toBe(
    'No type named "Zzzzzzzzzz". Name a type such as Task, or a field as Type.field such as Mutation.createPage.'
  )
})

test('an unknown field names the closest fields of that type', () => {
  expect(errorOf('Mutation.createPag')).toBe(
    'Mutation has no field "createPag". Did you mean "Mutation.createPage"?'
  )
})

test('an unknown type before the dot is refused before the field is looked up', () => {
  expect(errorOf('Mutaton.createPage')).toBe('No type named "Mutaton". Did you mean "Mutation"?')
})

test('a field of a type that has none is refused', () => {
  expect(errorOf('TaskStatusEnum.active')).toBe(
    '"TaskStatusEnum" is not an object or interface type, so it has no fields to pick. Describe it as TaskStatusEnum.'
  )
})

test('a name with more than one dot is refused', () => {
  expect(errorOf('Mutation.createPage.page')).toContain(
    '"Mutation.createPage.page" is not a type name or Type.field.'
  )
})

test('an empty field name is refused', () => {
  expect(errorOf('Mutation.')).toContain('Mutation has no field ""')
})
