import {addResolversToSchema} from '@graphql-tools/schema'
import {buildSchema, graphql} from 'graphql'
import {allow, deny, rule} from 'graphql-guard'
import composeResolvers, {type GuardRule} from '../composeResolvers'

const typeDefs = buildSchema(`
  interface Stage {
    meeting: String
  }
  type ResultStage implements Stage {
    meeting: String
    score: Int
  }
  type Query {
    stage: ResultStage
  }
`)

const resolvers = {
  Query: {stage: () => ({})},
  Stage: {meeting: () => 'from the interface'},
  ResultStage: {score: () => 3}
}

const queryStage = (permissions: Record<string, Record<string, GuardRule>>) => {
  const schema = addResolversToSchema({
    schema: typeDefs,
    resolvers: composeResolvers(resolvers, permissions, typeDefs),
    inheritResolversFromInterfaces: true
  })
  return graphql({schema, source: '{ stage { meeting score } }', contextValue: {}})
}

test('a rule on an inherited field wraps the resolver of the interface', async () => {
  const res = await queryStage({ResultStage: {meeting: allow}})
  expect(res).toEqual({data: {stage: {meeting: 'from the interface', score: 3}}})
})

test("a '*' rule covers inherited fields without replacing their resolver", async () => {
  const res = await queryStage({ResultStage: {'*': allow}})
  expect(res).toEqual({data: {stage: {meeting: 'from the interface', score: 3}}})
})

test("the interface's rule still applies under the type's own rule", async () => {
  const res = await queryStage({ResultStage: {'*': allow}, Stage: {meeting: deny}})
  expect(res.data).toEqual({stage: {meeting: null, score: 3}})
  expect(res.errors?.map(({message}) => message)).toEqual(['Not authorized'])
})

const cacheTypeDefs = buildSchema(`
  type Query {
    a: Int
    b: Int
  }
  type Mutation {
    before: Int
    login: Int
    after: Int
  }
`)

const makeSchema = () => {
  const isSignedIn = jest.fn(
    (_source: unknown, _args: unknown, {authToken}: {authToken: string | null}) =>
      authToken !== null
  )
  const isSignedInRule = rule('isSignedIn', {cache: 'contextual'})(isSignedIn)
  const resolvers = {
    Query: {a: () => 1, b: () => 2},
    Mutation: {
      before: () => 1,
      login: (_source: unknown, _args: unknown, context: {authToken: string | null}) => {
        context.authToken = 'viewer'
        return 1
      },
      after: () => 1
    }
  }
  const permissions = {
    Query: {'*': isSignedInRule},
    Mutation: {'*': isSignedInRule, login: allow}
  }
  const schema = addResolversToSchema({
    schema: cacheTypeDefs,
    resolvers: composeResolvers(resolvers, permissions, cacheTypeDefs)
  })
  return {isSignedIn, schema}
}

test('a rule result is cached for the rest of the operation', async () => {
  const {isSignedIn, schema} = makeSchema()
  const contextValue = {authToken: 'viewer', dataLoader: {}}
  const res = await graphql({schema, source: '{ a b }', contextValue})
  expect(res).toEqual({data: {a: 1, b: 2}})
  expect(isSignedIn).toHaveBeenCalledTimes(1)
})

test('a new authToken during the operation drops the cached rule results', async () => {
  const {isSignedIn, schema} = makeSchema()
  const contextValue = {authToken: null, dataLoader: {}}
  const res = await graphql({schema, source: 'mutation { before login after }', contextValue})
  expect(res.data).toEqual({before: null, login: 1, after: 1})
  expect(res.errors?.map(({message}) => message)).toEqual(['Not authorized'])
  expect(isSignedIn).toHaveBeenCalledTimes(2)
})
