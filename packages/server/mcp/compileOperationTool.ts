import {
  type GraphQLSchema,
  getNamedType,
  isInputObjectType,
  isInputType,
  Kind,
  type OperationDefinitionNode,
  OperationTypeNode,
  parse,
  print,
  TypeInfo,
  typeFromAST,
  validate,
  valueFromAST,
  visit,
  visitWithTypeInfo
} from 'graphql'
import getLeadingComment from './getLeadingComment'
import getVariableSchema from './getVariableSchema'
import type OperationTool from './OperationTool'
import {readAnnotations, writeAnnotations} from './toolAnnotations'

const getFeedingDescriptions = (schema: GraphQLSchema, document: ReturnType<typeof parse>) => {
  const descriptions = new Map<string, string>()
  const typeInfo = new TypeInfo(schema)
  visit(
    document,
    visitWithTypeInfo(typeInfo, {
      Variable(node, _key, parent) {
        const variableName = node.name.value
        if (descriptions.has(variableName) || !parent || !('kind' in parent)) return
        let description: string | null | undefined
        if (parent.kind === Kind.ARGUMENT) {
          description = typeInfo.getArgument()?.description
        } else if (parent.kind === Kind.OBJECT_FIELD) {
          const objectType = getNamedType(typeInfo.getParentInputType())
          if (isInputObjectType(objectType)) {
            description = objectType.getFields()[parent.name.value]?.description
          }
        }
        if (description) descriptions.set(variableName, description)
      }
    })
  )
  return descriptions
}

const compileOperationTool = (
  schema: GraphQLSchema,
  source: string,
  fileName: string
): OperationTool => {
  const fail = (message: string) => new Error(`${fileName}: ${message}`)
  let document: ReturnType<typeof parse>
  try {
    document = parse(source)
  } catch (error) {
    throw fail(error instanceof Error ? error.message : String(error))
  }
  const operations = document.definitions.filter(
    (definition): definition is OperationDefinitionNode =>
      definition.kind === Kind.OPERATION_DEFINITION
  )
  if (operations.length !== 1) throw fail('a tool file must hold exactly one operation')
  const operation = operations[0]!
  if (!operation.name) throw fail('the operation must be named')
  if (
    operation.operation !== OperationTypeNode.QUERY &&
    operation.operation !== OperationTypeNode.MUTATION
  ) {
    throw fail('the operation must be a query or a mutation')
  }
  const description = getLeadingComment(operation)
  if (!description) {
    throw fail('the operation needs a description comment on the lines directly above it')
  }
  const [firstError] = validate(schema, document)
  if (firstError) throw fail(firstError.message)

  const feedingDescriptions = getFeedingDescriptions(schema, document)
  const properties: Record<string, object> = {}
  const required: string[] = []
  for (const variableDefinition of operation.variableDefinitions ?? []) {
    const variableName = variableDefinition.variable.name.value
    const type = typeFromAST(schema, variableDefinition.type)
    if (!type || !isInputType(type)) throw fail(`unknown type for variable $${variableName}`)
    const variableSchema = getVariableSchema(schema, type, fileName)
    const comment = getLeadingComment(variableDefinition)
    const variableDescription = comment ?? feedingDescriptions.get(variableName)
    if (variableDescription) variableSchema.description = variableDescription
    const hasDefault = variableDefinition.defaultValue !== undefined
    if (hasDefault) {
      variableSchema.default = valueFromAST(variableDefinition.defaultValue, type)
    } else if (variableDefinition.type.kind === Kind.NON_NULL_TYPE) {
      required.push(variableName)
    }
    properties[variableName] = variableSchema
  }

  const operationName = operation.name.value
  const words = operationName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
  return {
    name: words.replace(/ /g, '_'),
    title: words.charAt(0).toUpperCase() + words.slice(1),
    description,
    inputSchema: {
      type: 'object',
      properties,
      ...(required.length > 0 ? {required} : {})
    },
    annotations:
      operation.operation === OperationTypeNode.QUERY ? readAnnotations : writeAnnotations,
    document: print(document)
  }
}

export default compileOperationTool
