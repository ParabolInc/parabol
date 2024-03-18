import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import NewMeeting from './NewMeeting'

// Placeholder so legacy types can still reference it until all types using this are migrated to codegen
const ActionMeeting = new GraphQLObjectType<any, GQLContext>({
  name: 'ActionMeeting',
  interfaces: () => [NewMeeting],
  description: 'An action meeting',
  fields: {}
})

export default ActionMeeting
