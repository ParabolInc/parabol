import {readFileSync} from 'node:fs'
import path from 'node:path'
import {addResolversToSchema} from '@graphql-tools/schema'
import {buildSchema, execute, parse} from 'graphql'
import TeamSubscriptionQuery from 'parabol-client/__generated__/TeamSubscription.graphql'
import generateUID from '../generateUID'
import UpdateCreditCardSuccess from '../graphql/public/types/UpdateCreditCardSuccess'
import resolveTypesForMutationPayloads from '../graphql/resolveTypesForMutationPayloads'

// rootSchema loads its resolvers with webpack's require.context, so add the ones this test needs onto the built SDL
const schema = resolveTypesForMutationPayloads(
  addResolversToSchema({
    schema: buildSchema(
      readFileSync(path.join(__dirname, '../graphql/public/schema.graphql'), 'utf8')
    ),
    resolvers: {UpdateCreditCardSuccess}
  })
)

// the client sends the TeamSubscription it persisted at build time
const getPersistedTeamSubscription = () => {
  const queryMap = JSON.parse(
    readFileSync(path.join(__dirname, '../../../queryMap.json'), 'utf8')
  ) as Record<string, string>
  return parse(queryMap[TeamSubscriptionQuery.params.id!]!)
}

test('a teammate receives the credit card update the mutation publishes', async () => {
  const orgId = generateUID()
  const organization = {id: orgId, isPaid: true, creditCard: null, updatedAt: new Date()}
  const result = await execute({
    schema,
    document: getPersistedTeamSubscription(),
    // the data updateCreditCard publishes to each team of the org
    rootValue: {
      teamSubscription: {
        fieldName: 'UpdateCreditCardPayload',
        UpdateCreditCardPayload: {teamIds: [], orgId}
      }
    },
    contextValue: {
      dataLoader: {
        get: () => ({loadNonNull: async () => organization, loadMany: async () => []})
      }
    }
  })
  expect(result.errors).toBeUndefined()
  expect(result.data?.teamSubscription).toMatchObject({
    fieldName: 'UpdateCreditCardPayload',
    UpdateCreditCardPayload: {organization: {id: orgId, isPaid: true}}
  })
})
