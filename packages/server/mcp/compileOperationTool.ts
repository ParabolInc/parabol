import {costLimitRule} from '@escape.tech/graphql-armor-cost-limit'
import {maxDepthRule} from '@escape.tech/graphql-armor-max-depth'
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
  specifiedRules,
  TypeInfo,
  typeFromAST,
  validate,
  valueFromAST,
  visit,
  visitWithTypeInfo
} from 'graphql'
import getLeadingComment from './getLeadingComment'
import getVariableSchema, {addDescription} from './getVariableSchema'
import type OperationTool from './OperationTool'
import {readAnnotations, writeAnnotations} from './toolAnnotations'

const MAX_OPERATION_COST = 300
const MAX_OPERATION_DEPTH = 12

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
  let cost = 0
  let depth = 0
  const [firstError] = validate(schema, document, [
    ...specifiedRules,
    costLimitRule({
      maxCost: Infinity,
      onAccept: [
        (_context, {n}) => {
          cost = Math.round(n)
        }
      ]
    }),
    maxDepthRule({
      n: Infinity,
      onAccept: [
        (_context, {n}) => {
          depth = n
        }
      ]
    })
  ])
  if (firstError) throw fail(firstError.message)
  if (depth > MAX_OPERATION_DEPTH) {
    throw fail(`the operation nests ${depth} deep, over the limit of ${MAX_OPERATION_DEPTH}`)
  }
  if (cost > MAX_OPERATION_COST) {
    throw fail(`the operation costs ${cost}, over the cap of ${MAX_OPERATION_COST}`)
  }

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
    addDescription(variableSchema, variableDescription)
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
