import {GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql'
import getReflectionEntities from '../mutations/helpers/getReflectionEntities'
import rateLimit from '../rateLimit'
import GetDemoEntitiesPayload from '../types/GetDemoEntitiesPayload'

const getDemoEntities = {
  type: GetDemoEntitiesPayload,
  args: {
    texts: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLString))),
      description: 'the reflection bodies to entitize'
    }
  },
  resolve: rateLimit({perMinute: 5, perHour: 50})(async (_source, {texts}) => {
    return Promise.all(texts.map(getReflectionEntities))
  })
}

export default getDemoEntities
