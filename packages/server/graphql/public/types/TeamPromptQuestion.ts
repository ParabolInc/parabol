import {Selectable} from 'kysely'
import {TeamPromptQuestionResolvers} from '../resolverTypes'
import {TeamPromptQuestion as DBTeamPromptQuestion} from '../../../postgres/pg.d'

export type TTeamPromptQuestion = Selectable<DBTeamPromptQuestion>

const TeamPromptQuestion: TeamPromptQuestionResolvers = {
  id: ({id}) => `teamPromptQuestion:${id}`
}

export default TeamPromptQuestion
