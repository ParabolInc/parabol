import {
  type GraphQLField,
  type GraphQLInputField,
  getDirectiveValues,
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isObjectType,
  isUnionType
} from 'graphql'
import {z} from 'zod'
import rootSchema from '../../graphql/public/rootSchema'
import defineTool from '../defineTool'
import getSchemaDescriptionLine from '../getSchemaDescriptionLine'
import {readAnnotations} from '../toolAnnotations'
import toolError from '../toolError'
import {textResult} from '../toolResult'

const describeScope = (field: GraphQLField<unknown, unknown>) => {
  const directive = rootSchema.getDirective('scope')
  const values = directive && field.astNode && getDirectiveValues(directive, field.astNode)
  if (!values) return ''
  if (values.ownerFromArg) {
    return ` [requires the write scope of the owner named by argument ${values.ownerFromArg}]`
  }
  return ` [requires scope ${values.name}]`
}

const describeField = (field: GraphQLField<unknown, unknown> | GraphQLInputField) => {
  const args =
    'args' in field && field.args.length
      ? `(${field.args.map((arg) => `${arg.name}: ${arg.type}`).join(', ')})`
      : ''
  const scope = 'args' in field ? describeScope(field) : ''
  const description = getSchemaDescriptionLine(field.description)
  return `  ${field.name}${args}: ${field.type}${scope}${description ? ` - ${description}` : ''}`
}

export default defineTool({
  name: 'describe_type',
  title: 'Describe a GraphQL type',
  description:
    'Show a GraphQL type: its fields with arguments and types, the scope each field requires, enum values, or union members. Start from Query or Mutation to see what you can call.',
  inputSchema: {
    name: z.string().min(1).describe('A type name such as Mutation, Task or CreateTaskInput')
  },
  annotations: readAnnotations,
  run: (_context, {name}) => {
    const type = rootSchema.getType(name)
    if (!type || name.startsWith('__')) {
      return toolError(`No type named ${name}. Use search_schema to find one.`, 'NOT_FOUND')
    }
    const header = [
      `${type.name}${getSchemaDescriptionLine(type.description) ? `: ${getSchemaDescriptionLine(type.description)}` : ''}`
    ]
    if (isObjectType(type) || isInterfaceType(type) || isInputObjectType(type)) {
      return textResult(
        [...header, ...Object.values(type.getFields()).map(describeField)].join('\n')
      )
    }
    if (isEnumType(type)) {
      return textResult(
        [...header, ...type.getValues().map(({name: value}) => `  ${value}`)].join('\n')
      )
    }
    if (isUnionType(type)) {
      return textResult([...header, `  one of: ${type.getTypes().join(', ')}`].join('\n'))
    }
    return textResult(header.join('\n'))
  }
})
