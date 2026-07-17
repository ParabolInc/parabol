import {getUserId} from '../../../utils/authorization'
import isValid from '../../isValid'
import type {TeamHealthTemplateResolvers} from '../resolverTypes'

const TeamHealthTemplate: TeamHealthTemplateResolvers = {
  __isTypeOf: ({type}) => type === 'teamHealth',
  questions: async ({id: templateId}, _args, {dataLoader}) => {
    const links = await dataLoader.get('teamHealthTemplateQuestionsByTemplateId').load(templateId)
    const questions = await dataLoader
      .get('teamHealthQuestions')
      .loadMany(links.map(({questionId}) => questionId))
    return questions.filter(isValid)
  },
  // the viewer sees only the built-in (aGhostUser) packs and their own personal pack
  availableQuestionPacks: async (_source, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const packs = (
      await dataLoader.get('teamHealthQuestionPacksByUserId').loadMany(['aGhostUser', viewerId])
    )
      .flat()
      .filter(isValid)
    return packs.sort((a, b) => {
      const aGhost = a.userId === 'aGhostUser'
      const bGhost = b.userId === 'aGhostUser'
      if (aGhost !== bGhost) return aGhost ? 1 : -1
      return a.createdAt.getTime() - b.createdAt.getTime()
    })
  }
}

export default TeamHealthTemplate
