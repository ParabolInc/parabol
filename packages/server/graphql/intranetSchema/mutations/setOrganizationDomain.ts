import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import {requireSU} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'

const setOrganizationDomain = {
  type: new GraphQLNonNull(GraphQLBoolean),
  description: 'manually set the domain that the organization belongs to',
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique identifier for the organization'
    },
    domain: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        'The top level domain of the company. Usually the part after the "@" in their email address'
    }
  },
  resolve: async (
    _source: unknown,
    {orgId, domain}: {orgId: string; domain: string},
    {authToken}: GQLContext
  ) => {
    const r = await getRethink()

    // AUTH
    requireSU(authToken)

    // VALIDATION
    const organization = await r.table('Organization').get(orgId).run()

    if (!organization) {
      throw new Error('Organization not found')
    }

    // RESOLUTION
    await r
      .table('Organization')
      .get(orgId)
      .update({
        activeDomain: domain,
        isActiveDomainTouched: true
      })
      .run()
    return true
  }
}

export default setOrganizationDomain
