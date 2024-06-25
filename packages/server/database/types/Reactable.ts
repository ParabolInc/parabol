import {RetroReflectionSource} from '../../graphql/public/types/RetroReflection'
import {TeamPromptResponse} from '../../postgres/queries/getTeamPromptResponsesByIds'
import Comment from './Comment'

export type ReactableEnum = 'COMMENT' | 'REFLECTION' | 'RESPONSE'
export type Reactable = RetroReflectionSource | Comment | TeamPromptResponse
