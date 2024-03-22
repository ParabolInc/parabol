import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import PokerTemplate from './PokerTemplate'
import StandardMutationError from './StandardMutationError'
import {getUserId} from '../../utils/authorization'
import User from './User'

const AddPokerTemplatePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddPokerTemplatePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    pokerTemplate: {
      type: PokerTemplate,
      resolve: ({templateId}, _args: unknown, {dataLoader}) => {
        if (!templateId) return null
        return dataLoader.get('meetingTemplates').load(templateId)
      }
    },
    user: {
      type: User,
      resolve: (_, _args: unknown, {dataLoader, authToken}) => {
        const userId = getUserId(authToken)
        if (!userId) return null
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

export default AddPokerTemplatePayload
