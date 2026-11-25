import {buildSchema} from 'graphql'
import describeGraphQLName, {MAX_ANSWER_LENGTH} from '../describeGraphQLName'

const DEPTH = 40
const WIDE_FIELD_COUNT = 3000
const CATALOG_FIELD_COUNT = 400
const WAREHOUSE_FIELD_COUNT = 1000
const DEPOT_FIELD_COUNT = 3000
const UNION_MEMBER_COUNT = 3000

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

const catalogFields = Array.from(
  {length: CATALOG_FIELD_COUNT},
  (_, idx) =>
    `"Describes item ${idx} at length, so that the whole catalog is far too long to read in one go"\n item${idx}(kind: PageKindEnum, since: DateTime): Page`
)
  .concat('legacyItem(kind: PageKindEnum): Page @deprecated(reason: "Use item0")')
  .join('\n')

const warehouseFields = Array.from(
  {length: WAREHOUSE_FIELD_COUNT},
  (_, idx) => `shelf${idx}(kind: PageKindEnum, since: DateTime): Page`
)
  .concat('oldShelf(kind: PageKindEnum, since: DateTime): Page @deprecated')
  .join('\n')

const depotFields = Array.from({length: DEPOT_FIELD_COUNT}, (_, idx) => `shelf${idx}: Page`).join(
  '\n'
)

const unionMembers = Array.from({length: UNION_MEMBER_COUNT}, (_, idx) => `Member${idx}`)
const memberTypes = unionMembers.map((name) => `type ${name} { id: ID }`).join('\n')

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

  interface Node {
    id: ID!
    "The pages below this one"
    children(kind: PageKindEnum): [Node!]!
  }

  type Page implements Node {
    id: ID!
    children(kind: PageKindEnum): [Node!]!
  }

  type Catalog implements Node {
    id: ID!
    children(kind: PageKindEnum): [Node!]!
    ${catalogFields}
  }

  type Warehouse {
    ${warehouseFields}
  }

  type Depot {
    ${depotFields}
  }

  union Everything = ${unionMembers.join(' | ')}

  ${memberTypes}

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

test('a field of an interface prints inside the interface with its argument types', () => {
  const sdl = sdlOf('Node.children')
  expect(sdl.startsWith('interface Node {')).toBe(true)
  expect(sdl).toContain('"""The pages below this one"""\n  children(kind: PageKindEnum): [Node!]!')
  expect(sdl).toContain('enum PageKindEnum {')
  expect(sdl).not.toContain('id: ID!')
})

test('a deep chain of nested inputs shows one level only', () => {
  const sdl = sdlOf('Mutation.nest')
  expect(sdl).toContain('input Nested0 {')
  expect(sdl).toContain('child: Nested1')
  expect(sdl).not.toContain('input Nested1 {')
})

test('an object type too long for one answer comes back as one line per field with argument names', () => {
  const answer = sdlOf('Catalog')
  expect(answer.length).toBeLessThanOrEqual(MAX_ANSWER_LENGTH)
  expect(answer.startsWith('type Catalog implements Node {\n')).toBe(true)
  expect(answer).toContain('\n  id: ID!\n')
  expect(answer).toContain('\n  children(kind): [Node!]!\n')
  expect(answer).toContain('\n  item0(kind, since): Page\n')
  expect(answer).toContain(`\n  item${CATALOG_FIELD_COUNT - 1}(kind, since): Page\n`)
  expect(answer).not.toContain('"""')
  expect(answer).toContain(
    `${CATALOG_FIELD_COUNT + 3} fields, too many to show in full. Describe one as Catalog.id for its arguments and descriptions.`
  )
})

test('a list keeps the deprecated marker on a deprecated field, with or without argument names', () => {
  expect(sdlOf('Catalog')).toContain('\n  legacyItem(kind): Page @deprecated\n')
  expect(sdlOf('Catalog')).not.toContain('item0(kind, since): Page @deprecated')
  expect(sdlOf('Warehouse')).toContain('\n  oldShelf: Page @deprecated\n')
})

test('a field of a type that came back as a list is still described in full', () => {
  const answer = sdlOf('Catalog.item7')
  expect(answer).toContain('Describes item 7 at length')
  expect(answer).toContain('item7(kind: PageKindEnum, since: DateTime): Page')
  expect(answer).toContain('enum PageKindEnum {')
})

test('a list that would still be too long drops the argument names', () => {
  const answer = sdlOf('Warehouse')
  expect(answer.length).toBeLessThanOrEqual(MAX_ANSWER_LENGTH)
  expect(answer).toContain('\n  shelf0: Page\n')
  expect(answer).toContain(`\n  shelf${WAREHOUSE_FIELD_COUNT - 1}: Page\n`)
  expect(answer).not.toContain('shelf0(')
  expect(answer).toContain(`${WAREHOUSE_FIELD_COUNT + 1} fields, too many to show in full.`)
})

test('a type too long even as a list is cut at a line under the cap with a plain note', () => {
  const answer = sdlOf('Depot')
  expect(answer.length).toBeLessThanOrEqual(MAX_ANSWER_LENGTH)
  expect(answer).not.toContain(`shelf${DEPOT_FIELD_COUNT - 1}`)
  expect(answer).toMatch(/\n…truncated: describe one field as Type\.field, or one type by name$/)
})

test('a huge input type is cut at a line under the cap with a plain note', () => {
  const answer = sdlOf('WideInput')
  expect(answer.length).toBeLessThanOrEqual(MAX_ANSWER_LENGTH)
  expect(answer).toContain('input WideInput {')
  expect(answer).toContain('option0: String')
  expect(answer).not.toContain(`option${WIDE_FIELD_COUNT - 1}:`)
  expect(answer).toMatch(/\n…truncated: describe one field as Type\.field, or one type by name$/)
})

test('a single line longer than the cap is still bounded', () => {
  const answer = sdlOf('Everything')
  expect(answer.length).toBeLessThanOrEqual(MAX_ANSWER_LENGTH)
  expect(answer.startsWith('union Everything = Member0 | Member1')).toBe(true)
  expect(answer).toMatch(/\n…truncated: describe one field as Type\.field, or one type by name$/)
})

test('a field keeps its own definition whole and leaves out an argument type that would not fit', () => {
  const answer = sdlOf('Mutation.sprawl')
  expect(answer.length).toBeLessThanOrEqual(MAX_ANSWER_LENGTH)
  expect(
    answer.startsWith(
      'type Mutation {\n  """Take a lot"""\n  sprawl(input: WideInput!): CreatePagePayload!\n}'
    )
  ).toBe(true)
  expect(answer).not.toContain('input WideInput')
  expect(answer).toMatch(
    /\n\nNot shown, over the answer limit: WideInput\. Describe each by name\.$/
  )
})

test('an unknown type names the closest types', () => {
  expect(errorOf('Taks')).toBe('No type named "Taks". Did you mean "Task"?')
})

test('a name that differs only in case names the type', () => {
  expect(errorOf('task')).toBe('No type named "task". Did you mean "Task"?')
})

test('a bare root field name names the root field it belongs to', () => {
  expect(errorOf('createPage')).toBe(
    'No type named "createPage". Did you mean "Mutation.createPage"?'
  )
  expect(errorOf('viewer')).toBe('No type named "viewer". Did you mean "Query.viewer"?')
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

test('an unknown field nothing resembles says how to name one', () => {
  expect(errorOf('Mutation.zzzzzzzzzz')).toBe(
    'Mutation has no field "zzzzzzzzzz". Name a type such as Task, or a field as Type.field such as Mutation.createPage.'
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
