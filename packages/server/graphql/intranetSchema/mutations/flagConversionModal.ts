import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import {GQLContext} from '../../graphql'
import FlagConversionModalPayload from '../../types/FlagConversionModalPayload'
import {requireSU} from '../../../utils/authorization'

const flagConversionModal = {
  type: FlagConversionModalPayload,
  description: 'add/remove a flag on an org asking them to pay',
  args: {
    active: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true to turn the modal on, false to turn it off'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the orgId to toggle the flag for'
    }
  },
  resolve: async (
    _source: unknown,
    {active, orgId}: {active: boolean; orgId: string},
    {authToken}: GQLContext
  ) => {
    const r = await getRethink()

    // AUTH
    requireSU(authToken)

    // VALIDATION
    const organization = await r.table('Organization').get(orgId).run()
    if (!organization) {
      return {error: {message: 'Invalid orgId'}}
    }

    // RESOLUTION
    await r
      .table('Organization')
      .get(orgId)
      .update({
        showConversionModal: active
      })
      .run()

    return {orgId}
  }
}

export default flagConversionModal
