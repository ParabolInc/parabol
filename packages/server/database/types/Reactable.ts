import {TeamPromptResponse} from '../../postgres/queries/getTeamPromptResponsesByIds'
import Comment from './Comment'
import Reflection from './Reflection'

export type ReactableEnum = 'COMMENT' | 'REFLECTION' | 'RESPONSE'
export type Reactable = Reflection | Comment | TeamPromptResponse
