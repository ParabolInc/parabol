import {GQLContext} from '../../graphql'

const getTeamIdFromArgTemplateId = async (
  _source: any,
  {templateId}: {templateId: string},
  {dataLoader}: GQLContext
) => {
  const template = await dataLoader.get('meetingTemplates').load(templateId)
  if (!template) return new Error('Invalid templateId')
  const {teamId} = template
  return teamId
}

export default getTeamIdFromArgTemplateId
