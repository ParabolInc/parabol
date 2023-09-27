import {GraphQLEnumType} from 'graphql'

const GcalVideoTypeEnum = new GraphQLEnumType({
  name: 'GcalVideoTypeEnum',
  description: 'The type of video conferencing used in the gcal event',
  values: {
    meet: {},
    zoom: {}
  }
})

export default GcalVideoTypeEnum
