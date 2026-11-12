import {makeExecutableSchema} from '@graphql-tools/schema'
import {getResolversFromSchema, type IResolvers} from '@graphql-tools/utils'
import {
  type ASTNode,
  type DefinitionNode,
  type DocumentNode,
  type FieldNode,
  type GraphQLFieldResolver,
  type GraphQLResolveInfo,
  type GraphQLSchema,
  Kind,
  type NameNode,
  parse,
  specifiedDirectives,
  specifiedScalarTypes,
  visit
} from 'graphql'
import getDataLoader from 'nest-graphql-endpoint/lib/getDataLoader'
import transformNestedSelection from 'nest-graphql-endpoint/lib/transformNestedSelection'
import type {
  EndpointContext,
  GraphQLEndpointError,
  NestedSource,
  NestGraphQLEndpointParams
} from 'nest-graphql-endpoint/lib/types'

export type NestEndpointParams<TContext> = Omit<NestGraphQLEndpointParams<TContext>, 'parentSchema'>

export interface NestedEndpoint {
  endpointTypeDefs: DocumentNode
  parentTypeDefs: string
  resolvers: IResolvers
}

type NestedResolverSource = NestedSource<EndpointContext> & {
  errorPromise?: Promise<GraphQLEndpointError[] | null | undefined>
  resolveErrors?: (errors: GraphQLEndpointError[] | null | undefined) => void
}

// if a field is aliased in the request that alias will be the key in the `source` object
const externalResolver: GraphQLFieldResolver<Record<string, unknown>, unknown> = (
  source,
  _args,
  _context,
  info
) => {
  const key = info.fieldNodes[0]!.alias?.value ?? info.fieldName
  return source[key]
}

const unprefixedTypeNames = new Set(specifiedScalarTypes.map(({name}) => name))
const specifiedDirectiveNames = new Set(specifiedDirectives.map(({name}) => name))
const namedNodeKinds = new Set<string>([
  Kind.NAMED_TYPE,
  Kind.SCALAR_TYPE_DEFINITION,
  Kind.OBJECT_TYPE_DEFINITION,
  Kind.INTERFACE_TYPE_DEFINITION,
  Kind.UNION_TYPE_DEFINITION,
  Kind.ENUM_TYPE_DEFINITION,
  Kind.INPUT_OBJECT_TYPE_DEFINITION,
  Kind.SCALAR_TYPE_EXTENSION,
  Kind.OBJECT_TYPE_EXTENSION,
  Kind.INTERFACE_TYPE_EXTENSION,
  Kind.UNION_TYPE_EXTENSION,
  Kind.ENUM_TYPE_EXTENSION,
  Kind.INPUT_OBJECT_TYPE_EXTENSION
])

// The endpoint's root types are not roots in the parent schema, and the parent's built-in directives win
const isNestableDefinition = (definition: DefinitionNode) =>
  definition.kind !== Kind.SCHEMA_DEFINITION &&
  definition.kind !== Kind.SCHEMA_EXTENSION &&
  !(
    definition.kind === Kind.DIRECTIVE_DEFINITION &&
    specifiedDirectiveNames.has(definition.name.value)
  )

// Renames the types like @graphql-tools/wrap's RenameRootTypes & RenameTypes, but on the AST, so no schema is built to rename it
const prefixTypeDefs = (schemaIDL: string, prefix: string): DocumentNode => {
  const document = parse(schemaIDL, {noLocation: true})
  const nestableDocument = {
    ...document,
    definitions: document.definitions.filter(isNestableDefinition)
  }
  return visit(nestableDocument, {
    Name(node: NameNode, _key, parent) {
      const parentNode = parent as ASTNode | undefined
      if (!parentNode || !namedNodeKinds.has(parentNode.kind)) return undefined
      if (unprefixedTypeNames.has(node.value)) return undefined
      return {...node, value: `${prefix}${node.value}`}
    }
  })
}

const getExternalResolvers = (endpointTypeDefs: DocumentNode) => {
  const resolvers: Record<string, Record<string, {resolve: typeof externalResolver}>> = {}
  endpointTypeDefs.definitions.forEach((definition) => {
    if (
      definition.kind !== Kind.OBJECT_TYPE_DEFINITION &&
      definition.kind !== Kind.OBJECT_TYPE_EXTENSION
    ) {
      return
    }
    const fieldResolvers = (resolvers[definition.name.value] ??= {})
    definition.fields?.forEach((field) => {
      fieldResolvers[field.name.value] = {resolve: externalResolver}
    })
  })
  return resolvers
}

export const nestGraphQLEndpoint = <TContext extends EndpointContext>(
  params: NestEndpointParams<TContext>
): NestedEndpoint => {
  const {
    parentType,
    fieldName,
    resolveEndpointContext,
    executor,
    schemaIDL,
    prefix,
    batchKey = 'accessToken',
    endpointTimeout = 10000
  } = params
  const endpointTypeDefs = prefixTypeDefs(schemaIDL, prefix)
  // only needed to transform a nested request, so the first one builds it
  let endpointSchema: GraphQLSchema | undefined
  const getEndpointSchema = () => {
    endpointSchema ??= makeExecutableSchema({typeDefs: schemaIDL})
    return endpointSchema
  }

  const resolveOperation =
    (isMutation?: boolean) =>
    async (
      source: NestedResolverSource,
      _args: unknown,
      executionRef: Record<string, unknown>,
      info: GraphQLResolveInfo
    ) => {
      if (source.errors) return null
      const {context, wrapper, wrapperVars} = source
      const {dataLoaderOptions} = context
      let transform: ReturnType<typeof transformNestedSelection>
      try {
        const operationType = isMutation ? 'mutation' : 'query'
        transform = transformNestedSelection(
          getEndpointSchema(),
          info,
          prefix,
          operationType,
          wrapper
        )
      } catch (e) {
        const errors = [{message: (e as Error).message || 'Transform error'}]
        if (source.resolveErrors) {
          source.resolveErrors(errors)
        } else {
          source.errors = errors
        }
        return null
      }
      const {document, variables, wrappedPath} = transform
      // Create a new dataloader for each execution (a context is created for each execution)
      const ghDataLoader = getDataLoader(executionRef, dataLoaderOptions)
      const res = await ghDataLoader.load({
        document,
        variables: {...variables, ...wrapperVars},
        context,
        options: {
          batchKey,
          endpointTimeout,
          executor,
          prefix,
          isMutation: !!isMutation
        }
      })
      if (source.resolveErrors) {
        source.resolveErrors(res.errors)
      } else {
        source.errors = res.errors
      }
      return wrappedPath
        ? wrappedPath.reduce<any>((obj, prop) => obj?.[prop] ?? null, res.data)
        : res.data
    }

  const parentTypeDefs = `
      type ${prefix}ErrorLocation {
        line: Int!
        column: Int!
      }
      type ${prefix}Error {
        message: String!
        locations: [${prefix}ErrorLocation!]
        path: [String!]
      }
      type ${prefix}Api {
        errors: [${prefix}Error!]
        query: ${prefix}Query
        mutation: ${prefix}Mutation
      }
      extend type ${parentType} {
        ${fieldName}: ${prefix}Api
      }`

  const resolvers: IResolvers = {
    ...getExternalResolvers(endpointTypeDefs),
    [parentType]: {
      [fieldName]: async (
        source: unknown,
        args: unknown,
        context: unknown,
        info: GraphQLResolveInfo
      ) => {
        const {fieldNodes} = info
        const [fieldNode] = fieldNodes
        const {selections} = fieldNode!.selectionSet!
        const queryField = selections.find(
          (selection): selection is FieldNode =>
            selection.kind === Kind.FIELD && selection.name.value === 'query'
        )
        const mutationField = selections.find(
          (selection): selection is FieldNode =>
            selection.kind === Kind.FIELD && selection.name.value === 'mutation'
        )
        if (queryField && mutationField) {
          return {
            errors: [
              {
                message: 'Request can only include query or mutation'
              }
            ]
          }
        }
        if (!queryField && !mutationField) {
          return {
            errors: [
              {
                message: 'No query or mutation operation provided'
              }
            ]
          }
        }
        let endpointContext: TContext
        try {
          endpointContext = await resolveEndpointContext(source, args, context, info)
        } catch (e) {
          return {
            errors: [
              {
                message: (e as Error).message || 'No endpoint context provided'
              }
            ]
          }
        }
        return {context: endpointContext}
      }
    },
    [`${prefix}Api`]: {
      errors: (source: NestedResolverSource) => {
        // If an error was triggered before fetch, abort early
        if (source.errors) return source.errors
        // If a fetch is already in flight, re-use the same promise
        if (source.errorPromise) return source.errorPromise
        // If the endpoint returns errors, populate the errors field
        source.errorPromise = new Promise((resolve) => {
          const timeout = setTimeout(() => {
            resolve([{message: `${prefix}: Resolution Timeout`}])
          }, endpointTimeout + 30)
          source.resolveErrors = (errors) => {
            clearTimeout(timeout)
            resolve(errors)
          }
        })
        return source.errorPromise
      },
      query: resolveOperation(),
      mutation: resolveOperation(true)
    }
  }
  return {endpointTypeDefs, parentTypeDefs, resolvers}
}

// Nesting every endpoint at once builds the merged schema once instead of once per endpoint
export const nestGraphQLEndpoints = (
  parentSchema: GraphQLSchema,
  endpoints: NestedEndpoint[],
  buildOptions?: {assumeValidSDL?: boolean; updateResolversInPlace?: boolean}
) =>
  makeExecutableSchema({
    typeDefs: [
      ...endpoints.map(({endpointTypeDefs}) => endpointTypeDefs).reverse(),
      parentSchema,
      ...endpoints.map(({parentTypeDefs}) => parentTypeDefs)
    ],
    resolvers: [getResolversFromSchema(parentSchema), ...endpoints.map(({resolvers}) => resolvers)],
    ...buildOptions
  })
