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
  }
}

export default TeamHealthTemplate
