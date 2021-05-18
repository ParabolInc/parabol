import {mergeSchemas} from '@graphql-tools/merge'
import {makeExecutableSchema} from '@graphql-tools/schema'
import {RenameRootTypes, RenameTypes, wrapSchema} from '@graphql-tools/wrap'
import {schema} from '@octokit/graphql-schema'
import {GraphQLResolveInfo, GraphQLSchema} from 'graphql'
import {Threshold} from '../../../client/types/constEnums'
import getRequestDataLoader, {GitHubGraphQLError} from './getRequestDataLoader'
import transformGitHubRequest from './transformGitHubRequest'

export interface AddToGitHubOptions {
  prefix?: string
}

type ResolveAccessToken = (
  source: any,
  args: any,
  context: any,
  info: GraphQLResolveInfo
) => string | Promise<string>

const addGitHubToSchema = (
  parentSchema: GraphQLSchema,
  parentType: string,
  resolveAccessToken: ResolveAccessToken,
  options?: AddToGitHubOptions
) => {
  const prefix = options?.prefix ?? '_GitHub'
  const prefixGitHub = (name: string) => `${prefix}${name}`
  const transformedGitHubSchema = wrapSchema({
    schema: makeExecutableSchema({
      typeDefs: schema.idl
    }),
    createProxyingResolver: () => (parent, _args, _context, info) => parent[info.fieldName],
    transforms: [new RenameRootTypes(prefixGitHub), new RenameTypes(prefixGitHub)]
  })

  const makeResolve = (isMutation: boolean) => async (
    {accessToken, resolveErrors, errors},
    _args,
    context,
    info
  ) => {
    if (errors) return null
    const {document, variables} = transformGitHubRequest(info, prefix)
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
    if (resolveErrors) resolveErrors(res.errors)
    return res.data
  }

  return mergeSchemas({
    schemas: [transformedGitHubSchema, parentSchema],
    typeDefs: `
      type ${prefix}ErrorLocation {
        line: Int!
        column: Int!
      }
      type ${prefix}Error {
        message: String!
        locations: [${prefix}ErrorLocation!]
        path: [String!]
      }
      type GitHubApi {
        errors: [${prefix}Error!]
        query: ${prefix}Query
        mutation: ${prefix}Mutation
      }
      extend type ${parentType} {
        api: GitHubApi
      }`,
    resolvers: {
      [parentType]: {
        api: async (source, args, context, info) => {
          const {fieldNodes} = info
          const [fieldNode] = fieldNodes
          const {selectionSet} = fieldNode
          const {selections} = selectionSet!
          const queryField = selections.find(
            (selection) => selection.kind === 'Field' && selection.name.value === 'query'
          )
          const mutationField = selections.find(
            (selection) => selection.kind === 'Field' && selection.name.value === 'mutation'
          )
          if (queryField && mutationField) {
            return {
              errors: [
                {
                  message: 'Cannot send a mutation and query at the same time'
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
          const accessToken = await resolveAccessToken(source, args, context, info)
          if (!accessToken) {
            return {
              errors: [
                {
                  message: 'No access token provided'
                }
              ]
            }
          }
          return {accessToken}
        }
      },
      GitHubApi: {
        errors: (source) => {
          if (source.errors) return source.errors
          if (source.errorPromise) {
            return source.errorPromise
          }
          source.errorPromise = new Promise((resolve) => {
            const timeout = setTimeout(() => {
              resolve([{message: 'Error Resolution Timeout'}])
            }, Threshold.MAX_INTEGRATION_FETCH_TIME + 1000)
            source.resolveErrors = (errors: GitHubGraphQLError[]) => {
              clearTimeout(timeout)
              resolve(errors)
            }
          })
          return source.errorPromise
        },
        query: makeResolve(false),
        mutation: makeResolve(true)
      }
    }
  })
}

export default addGitHubToSchema
