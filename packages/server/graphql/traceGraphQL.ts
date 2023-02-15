/**
 * @file Wrapping functions to instrument compiled queries.
 * These conflict with the dd-trace graphql plugin since they use the same fields to store intermediate data
 */
import {Span, SpanOptions, TraceOptions, Tracer} from 'dd-trace'
import {
  DefinitionNode,
  DocumentNode,
  ExecutionResult,
  GraphQLFieldResolver,
  GraphQLNamedType,
  GraphQLResolveInfo,
  GraphQLSchema,
  isObjectType,
  OperationDefinitionNode
} from 'graphql'
import {CompiledQuery, compileQuery, CompilerOptions, isCompiledQuery} from 'graphql-jit'
import {Path} from 'graphql/jsutils/Path'

interface ExecutionArgs {
  rootValue?: any
  contextValue?: any
  variableValues?: any
}

interface Config {
  /**
   * Whether to collapse list items into a single element. (i.e. single
   * `users.*.name` span instead of `users.0.name`, `users.1.name`, etc)
   *
   * @default true
   */
  collapse?: boolean

  /**
   * The maximum depth of fields/resolvers to instrument. Set to `0` to only
   * instrument the operation or to `-1` to instrument all fields/resolvers.
   *
   * @default -1
   */
  depth?: number

  /**
   * An object of optional callbacks to be executed during the respective
   * phase of a GraphQL operation. Undefined callbacks default to a noop
   * function.
   *
   * @default {}
   */
  hooks?: {
    execute?: (span: Span, args: ExecutionArgs, res?: any) => void
  }
}

/**
 * Return {@link compileQuery} function which will add tracing to the query.
 */
export function tracedCompileQuery(tracer: Tracer, config: Config) {
  if (process.env.DD_TRACE_ENABLED !== 'true') {
    return compileQuery
  }
  return function compileTracedQuery(
    schema: GraphQLSchema,
    document: DocumentNode,
    operationName?: string,
    partialOptions?: Partial<CompilerOptions>
  ) {
    wrapSchema(tracer, config, schema)
    const query = compileQuery(schema, document, operationName, partialOptions)
    if (isCompiledQuery(query)) {
      const operation = getOperation(document, operationName)!
      const type = operation.operation
      const name = operation.name?.value
      wrapCompiledQuery(tracer, config, query, name, type)
    }
    return query
  }
}

type PatchedMarker = {
  _datadog_patched?: boolean
}

/**
 * Wrap the query function of a `CompiledQuery` to trace it.
 * This needs the schema wrapped with {@see wrapSchema}.
 */
function wrapCompiledQuery(
  tracer: Tracer,
  config: Config,
  compiledQuery: CompiledQuery,
  operationName?: string,
  operationType?: string
) {
  const query = compiledQuery.query
  if ((query as PatchedMarker)._datadog_patched) return

  const resourceName = `${operationType} ${operationName}`
  const wrappedQuery = async (
    root: any,
    context: PatchedContext,
    variables: {[key: string]: any} | null | undefined
  ): Promise<ExecutionResult> => {
    return tracer.trace(
      'graphql',
      {
        tags: {
          'graphql.operation.name': operationName,
          'graphql.operation.type': operationType
        },
        type: 'graphql',
        resource: resourceName,
        measured: true,
        childOf: context?.ddChildOf
      } as TraceOptions & SpanOptions,
      async (span) => {
        if (!span) {
          return query(root, context, variables)
        }
        const scope = (span.tracer() as Tracer).scope()

        context._datadog_graphql = {span, fields: {}}

        try {
          const result = await scope.activate(span, () => query(root, context, variables))
          config.hooks?.execute?.(
            span,
            {rootValue: root, contextValue: context, variableValues: variables},
            result
          )
          return result
        } catch (error) {
          span.setTag('error', error)
          throw error
        } finally {
          finishResolvers(context)
        }
      }
    )
  }
  wrappedQuery._datadog_patched = true
  compiledQuery.query = wrappedQuery
}

function finishResolvers(contextValue: PatchedContext) {
  const fields = contextValue._datadog_graphql.fields

  Object.keys(fields)
    .reverse()
    .forEach((key) => {
      const field = fields[key]!

      if (field.error) {
        field.span.setTag('error', field.error)
      }
      field.span.finish(field.finishTime)
    })
}

type PatchedGraphQLSchema = GraphQLSchema & PatchedMarker
/**
 * Wrap all query and mutation resolvers with tracing functions.
 * This doesn't do any measuring unless it's used together with {@link wrapCompiledQuery}
 */
function wrapSchema(tracer: Tracer, config: Config, schema: PatchedGraphQLSchema) {
  if (schema._datadog_patched) return
  schema._datadog_patched = true

  const typeMap = schema.getTypeMap()
  Object.values(typeMap).forEach((namedType) => {
    // ignore introspection and scalar types
    if (namedType.name.startsWith('__') || !isObjectType(namedType)) return
    const fields = namedType.getFields()
    Object.values(fields).forEach((field: any) => {
      if (field.resolve) {
        field.resolve = wrappedResolve(tracer, config, field.resolve)
      }
    })
  })
}

interface Field {
  parent?: Field
  span: Span
  error?: any
  finishTime?: number
}

type PatchedContext = {
  ddChildOf?: any
  _datadog_graphql: {
    span: Span
    fields: {[name: string]: Field}
    source?: string
  }
}

function wrappedResolve(
  tracer: Tracer,
  config: Config,
  resolve: GraphQLFieldResolver<any, any>
): GraphQLFieldResolver<any, any> {
  if (typeof resolve !== 'function') {
    return resolve
  }
  const responsePathAsArray = config.collapse ? withCollapse(pathToArray) : pathToArray

  return async (source, args, context, info) => {
    if (!context._datadog_graphql) return resolve(source, args, context, info)

    const path = responsePathAsArray(info && info.path)

    if (config.depth !== undefined && config.depth >= 0) {
      const depth = path.filter((item) => typeof item === 'string').length

      if (config.depth < depth) {
        const parent = getParentField(context, path)

        const scope = (parent.span.tracer() as Tracer).scope()
        return scope.activate(parent.span, () => resolve(source, args, context, info))
      }
    }

    const field = assertField(tracer, context, info, path)

    const scope = (field.span.tracer() as Tracer).scope()
    try {
      const result = await scope.activate(field.span, () => resolve(source, args, context, info))
      return result
    } catch (error) {
      field.error = field.error || error
      throw field.error
    } finally {
      field.finishTime = (field.span as any)._getTime?.() ?? 0
    }
  }
}

function getParentField(context: PatchedContext, path: (string | number)[]) {
  for (let i = path.length - 1; i > 0; i--) {
    const field = context._datadog_graphql.fields[path.slice(0, i).join('.')]

    if (field) {
      return field
    }
  }

  return {
    span: context._datadog_graphql.span
  }
}

function startResolveSpan(
  tracer: Tracer,
  childOf: Span,
  path: (string | number)[],
  info: GraphQLResolveInfo
) {
  const span = tracer.startSpan('graphql.resolve', {
    childOf: childOf ?? tracer.scope().active() ?? undefined,
    tags: {
      'span.type': 'graphql'
    }
  })

  span.addTags({
    'resource.name': `${info.fieldName}:${info.returnType}`,
    'graphql.field.name': info.fieldName,
    'graphql.field.path': path.join('.'),
    'graphql.field.type': (info.returnType as GraphQLNamedType).name,
    // not sure if this is needed if the outer span is measured already, but that's what the graphql plugin does
    '_dd.measured': true
  })

  return span
}

function assertField(
  tracer: Tracer,
  context: PatchedContext,
  info: GraphQLResolveInfo,
  path: (string | number)[]
) {
  const pathString = path.join('.')
  const fields = context._datadog_graphql.fields

  let field = fields[pathString]

  if (!field) {
    const parent = getParentField(context, path)

    field = fields[pathString] = {
      parent,
      span: startResolveSpan(tracer, parent.span, path, info),
      error: null
    }
  }

  return field
}

function pathToArray(path: Path) {
  const flattened: (string | number)[] = []
  let curr: Path | undefined = path
  while (curr) {
    flattened.push(curr.key)
    curr = curr.prev
  }
  return flattened.reverse()
}

function withCollapse(responsePathAsArray: typeof pathToArray) {
  return function (path: Path) {
    return responsePathAsArray(path).map((segment) => (typeof segment === 'number' ? '*' : segment))
  }
}

function isOperationDefinitionNode(node: DefinitionNode): node is OperationDefinitionNode {
  return node.kind === 'OperationDefinition'
}

function getOperation(document: DocumentNode, operationName?: string) {
  const definitions = document.definitions

  if (operationName) {
    return definitions
      .filter(isOperationDefinitionNode)
      .find((def) => operationName === def.name?.value)
  } else {
    return definitions.find(isOperationDefinitionNode)
  }
}
