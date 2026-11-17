import {addResolversToSchema} from '@graphql-tools/schema'
import {buildSchema, graphql} from 'graphql'
import {allow, deny} from 'graphql-shield'
import composeResolvers, {type ShieldRule} from '../composeResolvers'

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

const queryStage = (permissions: Record<string, Record<string, ShieldRule>>) => {
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
