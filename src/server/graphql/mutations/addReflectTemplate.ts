import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import standardError from '../../utils/standardError'
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

    if (allTemplates.length >= 20) {
      return standardError(new Error('Too many templates'), {userId: viewerId})
    }
    if (allTemplates.find((template) => template.name === '*New Template')) {
      return standardError(new Error('Template already created'), {userId: viewerId})
    }

    // RESOLUTION
    const base = {'*New Template': [{question: 'New prompt', description: ''}]}
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
