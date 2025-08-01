import {GraphQLObjectType} from 'graphql'
import type {GQLContext} from '../graphql'

const PokerMeeting = new GraphQLObjectType<any, GQLContext>({
  name: 'PokerMeeting',
  fields: {}
})

export default PokerMeeting
