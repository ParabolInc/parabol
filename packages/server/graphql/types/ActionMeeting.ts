import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import NewMeeting from './NewMeeting'

const ActionMeeting = new GraphQLObjectType<any, GQLContext>({
  name: 'ActionMeeting',
  interfaces: () => [NewMeeting],
  description: 'An action meeting',
  fields: () => ({})
})

export default ActionMeeting
