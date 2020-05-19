import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import AddReflectTemplatePayload from '../types/AddReflectTemplatePayload'
import makeRetroTemplates from './helpers/makeRetroTemplates'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {PALETTE} from '../../../client/styles/paletteV2'

const addReflectTemplate = {
  description: 'Add a new template full of prompts',
  type: AddReflectTemplatePayload,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(_source, {teamId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const allTemplates = await r
      .table('ReflectTemplate')
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true})
      .run()

    if (allTemplates.length >= 20) {
      return standardError(new Error('Too many templates'), {userId: viewerId})
    }
    if (allTemplates.find((template) => template.name === '*New Template')) {
      return standardError(new Error('Template already created'), {userId: viewerId})
    }

    // RESOLUTION
    const base = {
      '*New Template': [
        {
          question: 'New prompt',
          description: '',
          groupColor: PALETTE.PROMPT_GREEN
        }
      ]
    }
    const {phaseItems, templates} = makeRetroTemplates(teamId, base)

    await r({
      newTemplate: r.table('ReflectTemplate').insert(templates),
      newPhaseItem: r.table('CustomPhaseItem').insert(phaseItems)
    }).run()

    const templateId = templates[0].id
    const data = {templateId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddReflectTemplatePayload', data, subOptions)
    return data
  }
}

export default addReflectTemplate
