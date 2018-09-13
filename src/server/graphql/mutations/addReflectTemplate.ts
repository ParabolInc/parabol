import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {isTeamMember} from 'server/utils/authorization'
import {
  sendTeamAccessError,
  sendTooManyTemplatesError,
  sendAlreadyCreatedTemplateError
} from 'server/utils/authorizationErrors'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import AddReflectTemplatePayload from '../types/AddReflectTemplatePayload'
import makeRetroTemplates from './helpers/makeRetroTemplates'

const addReflectTemplate = {
  description: 'Add a new template full of prompts',
  type: AddReflectTemplatePayload,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve (_source, {teamId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId)
    }

    // VALIDATION
    const allTemplates = await r
      .table('ReflectTemplate')
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true})

    if (allTemplates.length >= 20) {
      return sendTooManyTemplatesError(authToken, teamId)
    }
    if (allTemplates.find((template) => template.name === '*New Template')) {
      return sendAlreadyCreatedTemplateError(authToken, teamId)
    }

    // RESOLUTION
    const base = {'*New Template': [{question: 'New prompt'}]}
    const {phaseItems, templates} = makeRetroTemplates(teamId, base)

    await r({
      newTemplate: r.table('ReflectTemplate').insert(templates),
      newPhaseItem: r.table('CustomPhaseItem').insert(phaseItems)
    })

    const templateId = templates[0].id
    const data = {templateId}
    publish(TEAM, teamId, AddReflectTemplatePayload, data, subOptions)
    return data
  }
}

export default addReflectTemplate
