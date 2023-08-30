import {Selectable} from 'kysely'
import {TeamPromptQuestionResolvers} from '../resolverTypes'
import {TeamPromptQuestion} from '../../../postgres/pg.d'

export type TTeamPromptQuestion = Selectable<TeamPromptQuestion>

const TeamPromptQuestion: TeamPromptQuestionResolvers = {
  id: ({id}) => `teamPromptQuestion:${id}`
}

export default TeamPromptQuestion
