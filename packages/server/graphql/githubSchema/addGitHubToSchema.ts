import {schema as rawSchema} from '@octokit/graphql-schema'
import {GraphQLResolveInfo, GraphQLSchema} from 'graphql'
import {
  makeExecutableSchema,
  mergeSchemas,
  RenameRootTypes,
  RenameTypes,
  wrapSchema
} from 'graphql-tools'
import getRequestDataLoader from './getRequestDataLoader'
import transformGitHubRequest from './transformGitHubRequest'

export interface AddToGitHubOptions {
  prefix?: string
}

type ResolveAccessToken = (
  source: any,
  args: any,
  context: any,
  info: GraphQLResolveInfo
) => Promise<string>

const addGitHubToSchema = (
  schema: GraphQLSchema,
  parentType: string,
  resolveAccessToken: ResolveAccessToken,
  options?: AddToGitHubOptions
) => {
  const prefix = options?.prefix ?? '_GitHub'
  const prefixGitHub = (name: string) => `${prefix}${name}`
  const transformedGitHubSchema = wrapSchema({
    schema: makeExecutableSchema({
      typeDefs: rawSchema.idl
    }),
    createProxyingResolver: () => (parent, _args, _context, info) => parent[info.fieldName],
    transforms: [new RenameRootTypes(prefixGitHub), new RenameTypes(prefixGitHub)]
  })

  const makeResolve = (isMutation: boolean) => async (source, args, context, info) => {
    const {document, variables} = transformGitHubRequest(info)
    const accessToken = await resolveAccessToken(source, args, context, info)
    // Create a new dataloader whenever the context changes (once per execution)
    const ghDataLoader = getRequestDataLoader(context)
    const res = await ghDataLoader.load({
      document,
      variables,
      accessToken,
      options: {
        prefix,
        isMutation
      }
    })
    return res
  }

  return mergeSchemas({
    schemas: [transformedGitHubSchema, schema],
    typeDefs: `
      extend type ${parentType} {
        query: ${prefix}Query
        mutation: ${prefix}Mutation
      }`,
    resolvers: {
      [parentType]: {
        query: makeResolve(false),
        mutation: makeResolve(true)
      }
    }
  })
}

export default addGitHubToSchema
