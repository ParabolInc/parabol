import type {TeamPromptTemplateResolvers} from '../resolverTypes'

const TeamPromptTemplate: TeamPromptTemplateResolvers = {
  __isTypeOf: ({type}) => type === 'teamPrompt',
  prompts: async ({id: templateId}, _args, {dataLoader}) => {
    const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(templateId)
    return prompts
      .filter((prompt) => !prompt.removedAt)
      .sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
  },
  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default TeamPromptTemplate
