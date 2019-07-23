import {GraphQLEnumType} from 'graphql'

const SegmentClientEventEnum = new GraphQLEnumType({
  name: 'SegmentClientEventEnum',
  description: 'The client event to report to segment',
  values: {
    UserLogout: {},
    UserLogin: {},
    HelpMenuOpen: {}
  }
})

export default SegmentClientEventEnum
