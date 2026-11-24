import {
  type GraphQLInputType,
  type GraphQLSchema,
  isEnumType,
  isInputObjectType,
  isListType,
  isNonNullType,
  isScalarType
} from 'graphql'

const getVariableSchema = (
  schema: GraphQLSchema,
  type: GraphQLInputType,
  fileName: string,
  expanding: ReadonlySet<string> = new Set()
): Record<string, unknown> => {
  if (isNonNullType(type)) return getVariableSchema(schema, type.ofType, fileName, expanding)
  if (isListType(type)) {
    return {type: 'array', items: getVariableSchema(schema, type.ofType, fileName, expanding)}
  }
  if (isEnumType(type)) {
    return {type: 'string', enum: type.getValues().map(({name}) => name)}
  }
  if (isInputObjectType(type)) {
    if (expanding.has(type.name)) {
      throw new Error(`${fileName}: input type ${type.name} refers to itself`)
    }
    const nextExpanding = new Set(expanding).add(type.name)
    const properties: Record<string, unknown> = {}
    const required: string[] = []
    for (const field of Object.values(type.getFields())) {
      const fieldSchema = getVariableSchema(schema, field.type, fileName, nextExpanding)
      if (field.description) fieldSchema.description = field.description
      if (field.defaultValue !== undefined) fieldSchema.default = field.defaultValue
      properties[field.name] = fieldSchema
      if (isNonNullType(field.type) && field.defaultValue === undefined) required.push(field.name)
    }
    return {
      type: 'object',
      properties,
      ...(required.length > 0 ? {required} : {})
    }
  }
  if (isScalarType(type)) {
    switch (type.name) {
      case 'File':
        throw new Error(`${fileName}: a File variable has no JSON Schema form`)
      case 'Int':
        return {type: 'integer'}
      case 'Float':
        return {type: 'number'}
      case 'Boolean':
        return {type: 'boolean'}
      case 'DateTime':
        return {type: 'string', format: 'date-time'}
      default:
        return {type: 'string'}
    }
  }
  throw new Error(`${fileName}: cannot describe type ${String(type)}`)
}

export default getVariableSchema
