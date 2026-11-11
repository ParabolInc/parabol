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

const shieldedSchema = makeExecutableSchema({
  typeDefs: typeDefs.concat(publicTypeDefs),
  resolvers: composeResolvers(resolvers, permissions),
  ...schemaBuildOptions
})
const privateSchema = resolveTypesForMutationPayloads(shieldedSchema)

// mergeSchemas without its search for extensions, which copies both schemas to find none
const buildFullSchema = (publicSchema: GraphQLSchema) =>
  makeExecutableSchema({
    typeDefs: [privateSchema, publicSchema],
    resolvers: [getResolversFromSchema(privateSchema), getResolversFromSchema(publicSchema)],
    ...schemaBuildOptions
  })

const fullSchema = buildFullSchema(publicSchema)

let fullSchemaWithAllNestedTypes: GraphQLSchema | undefined
export const getFullSchemaWithAllNestedTypes = () => {
  if (hasEveryNestedType) return fullSchema
  fullSchemaWithAllNestedTypes ??= buildFullSchema(getPublicSchemaWithAllNestedTypes())
  return fullSchemaWithAllNestedTypes
}

export default fullSchema
