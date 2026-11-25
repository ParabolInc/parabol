import {
  GraphQLInterfaceType,
  GraphQLObjectType,
  type GraphQLSchema,
  getNamedType,
  isInterfaceType,
  isObjectType,
  isSpecifiedScalarType,
  printType
} from 'graphql'
import {didYouMean} from 'graphql/jsutils/didYouMean'
import {suggestionList} from 'graphql/jsutils/suggestionList'
import {MAX_RESULT_LENGTH} from './toolResult'

const TRUNCATION_NOTICE = '\n…truncated: describe one field as Type.field, or one type by name'
const NAMING_HINT =
  'Name a type such as Task, or a field as Type.field such as Mutation.createPage.'

type Described = {sdl: string} | {error: string}

const truncate = (sdl: string) =>
  sdl.length <= MAX_RESULT_LENGTH
    ? sdl
    : sdl.slice(0, sdl.lastIndexOf('\n', MAX_RESULT_LENGTH - TRUNCATION_NOTICE.length)) +
      TRUNCATION_NOTICE

const printField = (type: GraphQLObjectType | GraphQLInterfaceType, fieldName: string) => {
  const config = {name: type.name, fields: {[fieldName]: type.toConfig().fields[fieldName]!}}
  return printType(
    isObjectType(type) ? new GraphQLObjectType(config) : new GraphQLInterfaceType(config)
  )
}

const describeField = (type: GraphQLObjectType | GraphQLInterfaceType, fieldName: string) => {
  const {args} = type.getFields()[fieldName]!
  const argumentTypes = new Set(
    args
      .map((arg) => getNamedType(arg.type))
      .filter((argumentType) => !isSpecifiedScalarType(argumentType))
  )
  return [printField(type, fieldName), ...[...argumentTypes].map((named) => printType(named))].join(
    '\n\n'
  )
}

const describeGraphQLName = (schema: GraphQLSchema, name: string): Described => {
  const [typeName = '', fieldName, ...extra] = name.split('.')
  if (extra.length) {
    return {error: `"${name}" is not a type name or Type.field. ${NAMING_HINT}`}
  }
  const type = schema.getType(typeName)
  if (!type) {
    const suggestions = suggestionList(typeName, Object.keys(schema.getTypeMap()))
    return {
      error: suggestions.length
        ? `No type named "${typeName}".${didYouMean(suggestions)}`
        : `No type named "${typeName}". ${NAMING_HINT}`
    }
  }
  if (fieldName === undefined) return {sdl: truncate(printType(type))}
  if (!isObjectType(type) && !isInterfaceType(type)) {
    return {
      error: `"${typeName}" is not an object or interface type, so it has no fields to pick. Describe it as ${typeName}.`
    }
  }
  const fieldNames = Object.keys(type.getFields())
  if (!fieldNames.includes(fieldName)) {
    return {
      error: `${typeName} has no field "${fieldName}".${didYouMean(
        suggestionList(fieldName, fieldNames).map((suggested) => `${typeName}.${suggested}`)
      )}`
    }
  }
  return {sdl: truncate(describeField(type, fieldName))}
}

export default describeGraphQLName
