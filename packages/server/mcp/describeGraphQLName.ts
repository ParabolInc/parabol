import {
  GraphQLInterfaceType,
  type GraphQLNamedType,
  GraphQLObjectType,
  type GraphQLSchema,
  getNamedType,
  isInterfaceType,
  isObjectType,
  isSpecifiedScalarType,
  printType
} from 'graphql'

export const MAX_ANSWER_LENGTH = 20_000
const OMISSION_NOTE_ROOM = 500
const MAX_SUGGESTIONS = 5
const TRUNCATION_NOTICE = '\n…truncated: describe one field as Type.field, or one type by name'
const NAMING_HINT =
  'Name a type such as Task, or a field as Type.field such as Mutation.createPage.'

type Described = {sdl: string} | {error: string}
type FieldedType = GraphQLObjectType | GraphQLInterfaceType

const bound = (text: string) => {
  if (text.length <= MAX_ANSWER_LENGTH) return text
  const room = MAX_ANSWER_LENGTH - TRUNCATION_NOTICE.length
  const lineEnd = text.lastIndexOf('\n', room)
  return text.slice(0, lineEnd > 0 ? lineEnd : room) + TRUNCATION_NOTICE
}

const getEditDistance = (from: string, to: string) => {
  let previous = Array.from({length: to.length + 1}, (_, idx) => idx)
  for (let row = 1; row <= from.length; row++) {
    const current = [row]
    for (let column = 1; column <= to.length; column++) {
      current[column] = Math.min(
        previous[column]! + 1,
        current[column - 1]! + 1,
        previous[column - 1]! + (from[row - 1] === to[column - 1] ? 0 : 1)
      )
    }
    previous = current
  }
  return previous[to.length]!
}

const getCloseMatches = (input: string, options: string[]) => {
  const lowered = input.toLowerCase()
  const maxDistance = Math.floor(input.length * 0.4) + 1
  return options
    .flatMap((option) =>
      Math.abs(option.length - input.length) > maxDistance
        ? []
        : [{option, distance: getEditDistance(lowered, option.toLowerCase())}]
    )
    .filter(({distance}) => distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance || a.option.localeCompare(b.option))
    .slice(0, MAX_SUGGESTIONS)
    .map(({option}) => option)
}

const refuse = (message: string, suggestions: string[]) => ({
  error: suggestions.length
    ? `${message} Did you mean ${new Intl.ListFormat('en', {type: 'disjunction'}).format(
        suggestions.map((suggestion) => `"${suggestion}"`)
      )}?`
    : `${message} ${NAMING_HINT}`
})

const printField = (type: FieldedType, fieldName: string) => {
  const config = {name: type.name, fields: {[fieldName]: type.toConfig().fields[fieldName]!}}
  return printType(
    isObjectType(type) ? new GraphQLObjectType(config) : new GraphQLInterfaceType(config)
  )
}

const listFields = (type: FieldedType) => {
  const fields = Object.values(type.getFields())
  const interfaces = type.getInterfaces().map(({name}) => name)
  const header = `${isObjectType(type) ? 'type' : 'interface'} ${type.name}${
    interfaces.length ? ` implements ${interfaces.join(' & ')}` : ''
  } {`
  const footer = `}\n\n${fields.length} fields, too many to show in full. Describe one as ${type.name}.${fields[0]!.name} for its arguments and descriptions.`
  const list = (withArgumentNames: boolean) =>
    [
      header,
      ...fields.map(
        ({name, args, type: returnType, deprecationReason}) =>
          `  ${name}${withArgumentNames && args.length ? `(${args.map((arg) => arg.name).join(', ')})` : ''}: ${returnType}${typeof deprecationReason === 'string' ? ' @deprecated' : ''}`
      ),
      footer
    ].join('\n')
  const withArgumentNames = list(true)
  return bound(withArgumentNames.length <= MAX_ANSWER_LENGTH ? withArgumentNames : list(false))
}

const describeType = (type: GraphQLNamedType) => {
  const sdl = printType(type)
  if (sdl.length <= MAX_ANSWER_LENGTH) return sdl
  return isObjectType(type) || isInterfaceType(type) ? listFields(type) : bound(sdl)
}

const describeField = (type: FieldedType, fieldName: string) => {
  const {args} = type.getFields()[fieldName]!
  const argumentTypes = new Set(
    args
      .map((arg) => getNamedType(arg.type))
      .filter((argumentType) => !isSpecifiedScalarType(argumentType))
  )
  const sections = [bound(printField(type, fieldName))]
  const omitted: string[] = []
  let length = sections[0]!.length
  for (const argumentType of argumentTypes) {
    const sdl = printType(argumentType)
    if (length + sdl.length + 2 > MAX_ANSWER_LENGTH - OMISSION_NOTE_ROOM) {
      omitted.push(argumentType.name)
    } else {
      sections.push(sdl)
      length += sdl.length + 2
    }
  }
  if (omitted.length) {
    sections.push(`Not shown, over the answer limit: ${omitted.join(', ')}. Describe each by name.`)
  }
  return bound(sections.join('\n\n'))
}

const getRootFieldCoordinates = (schema: GraphQLSchema, fieldName: string) =>
  [schema.getQueryType(), schema.getMutationType(), schema.getSubscriptionType()].flatMap((root) =>
    root?.getFields()[fieldName] ? [`${root.name}.${fieldName}`] : []
  )

const describeGraphQLName = (schema: GraphQLSchema, name: string): Described => {
  const [typeName = '', fieldName, ...extra] = name.split('.')
  if (extra.length) return refuse(`"${name}" is not a type name or Type.field.`, [])
  const type = schema.getType(typeName)
  if (!type) {
    const rootFields = getRootFieldCoordinates(schema, typeName)
    return refuse(
      `No type named "${typeName}".`,
      rootFields.length ? rootFields : getCloseMatches(typeName, Object.keys(schema.getTypeMap()))
    )
  }
  if (fieldName === undefined) return {sdl: describeType(type)}
  if (!isObjectType(type) && !isInterfaceType(type)) {
    return {
      error: `"${typeName}" is not an object or interface type, so it has no fields to pick. Describe it as ${typeName}.`
    }
  }
  const fieldNames = Object.keys(type.getFields())
  if (!fieldNames.includes(fieldName)) {
    return refuse(
      `${typeName} has no field "${fieldName}".`,
      getCloseMatches(fieldName, fieldNames).map((suggested) => `${typeName}.${suggested}`)
    )
  }
  return {sdl: describeField(type, fieldName)}
}

export default describeGraphQLName
