import {makeExecutableSchema} from '@graphql-tools/schema'
import {getResolversFromSchema} from '@graphql-tools/utils'
import type {GraphQLSchema} from 'graphql'
import composeResolvers from '../composeResolvers'
import {typeDefs as publicTypeDefs} from '../public/importedTypeDefs'
import publicSchema, {
  getPublicSchemaWithAllNestedTypes,
  hasEveryNestedType
} from '../public/rootSchema'
import resolveTypesForMutationPayloads from '../resolveTypesForMutationPayloads'
import schemaBuildOptions from '../schemaBuildOptions'
import {typeDefs} from './importedTypeDefs'
import permissions from './permissions'
import resolvers from './resolvers'

let privateSchema: GraphQLSchema | undefined
const getPrivateSchema = () => {
  privateSchema ??= resolveTypesForMutationPayloads(
    makeExecutableSchema({
      typeDefs: typeDefs.concat(publicTypeDefs),
      resolvers: composeResolvers(resolvers, permissions),
      ...schemaBuildOptions
    })
  )
  return privateSchema
}

// mergeSchemas without its search for extensions, which copies both schemas to find none
const buildFullSchema = (publicSchema: GraphQLSchema) =>
  makeExecutableSchema({
    typeDefs: [getPrivateSchema(), publicSchema],
    resolvers: [getResolversFromSchema(getPrivateSchema()), getResolversFromSchema(publicSchema)],
    ...schemaBuildOptions
  })

let fullSchema: GraphQLSchema | undefined
// Only super users & the server's own operations use it, so the first of those builds it instead of every startup
export const getFullSchema = () => {
  fullSchema ??= buildFullSchema(publicSchema)
  return fullSchema
}

let fullSchemaWithAllNestedTypes: GraphQLSchema | undefined
export const getFullSchemaWithAllNestedTypes = () => {
  if (hasEveryNestedType) return getFullSchema()
  fullSchemaWithAllNestedTypes ??= buildFullSchema(getPublicSchemaWithAllNestedTypes())
  return fullSchemaWithAllNestedTypes
}
