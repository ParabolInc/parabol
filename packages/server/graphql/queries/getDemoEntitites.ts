import {GraphQLNonNull, GraphQLString} from 'graphql'
import getReflectionEntities from '../mutations/helpers/getReflectionEntities'
import rateLimit from '../rateLimit'
import GetDemoEntitiesPayload from '../types/GetDemoEntitiesPayload'

const getDemoEntities = {
  type: GraphQLNonNull(GetDemoEntitiesPayload),
  args: {
    text: {
      type: GraphQLNonNull(GraphQLString),
      description: 'the reflection bodies to entitize'
    }
  },
  resolve: rateLimit({perMinute: 5, perHour: 50})(async (_source, {text}) => {
    const entities = await getReflectionEntities(text)
    return {entities}
  })
}

export default getDemoEntities
