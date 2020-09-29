import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import PokerMeetingSettings from './PokerMeetingSettings'

export const PersistJiraSearchQuerySuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'PersistJiraSearchQuerySuccess',
  fields: () => ({
    settings: {
      type: GraphQLNonNull(PokerMeetingSettings),
      description: 'The meeting settings with the updated jira search history',
      resolve: ({settingsId}, _args, {dataLoader}) => {
        return dataLoader.get('meetingSettings').load(settingsId)
      }
    }
  })
})

const PersistJiraSearchQueryPayload = makeMutationPayload(
  'PersistJiraSearchQueryPayload',
  PersistJiraSearchQuerySuccess
)

export default PersistJiraSearchQueryPayload
